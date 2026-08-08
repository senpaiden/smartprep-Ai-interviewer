import json
import os
import random
from openai import OpenAI
from django.conf import settings
from qdrant_client import QdrantClient

def load_json(filename):
    path = os.path.join(settings.BASE_DIR, 'hackathon_data', filename)
    with open(path, 'r') as f:
        return json.load(f)

def get_candidates():
    try:
        return load_json('candidates.json').get('candidates', [])
    except Exception:
        return []

def get_candidate_by_id(candidate_id):
    for c in get_candidates():
        if c.get('member', {}).get('id') == candidate_id:
            return c
    return None

def get_nvidia_client():
    return OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=settings.NVIDIA_API_KEY
    )

def get_qdrant_client():
    url = getattr(settings, 'QDRANT_URL', None)
    api_key = getattr(settings, 'QDRANT_API_KEY', None)
    if url:
        client = QdrantClient(url=url, api_key=api_key)
    else:
        client = QdrantClient(path=os.path.join(settings.BASE_DIR, 'qdrant_data'))
    client.set_model("BAAI/bge-small-en-v1.5")
    return client

NVIDIA_MODEL = "meta/llama-3.1-70b-instruct"

def generate_hackathon_response(session, latest_message=None):
    client = get_nvidia_client()
    qdrant = get_qdrant_client()
    candidate = session.candidate_data
    
    # B6: Identify skipped/struggled/failed missions
    weak_topics = [m['title'] for m in candidate.get('missions', []) if m.get('skipped') or m.get('attempts', 0) > 2 or m.get('passed') is False]
    
    # B9: Build a search query that targets uncovered curriculum days
    all_days = set(range(1, 32))
    covered = set(session.covered_days)
    uncovered = all_days - covered
    
    if latest_message:
        search_query = latest_message
    else:
        search_query = f"Interview questions for {candidate.get('member', {}).get('jobRole')}"
    
    # B4: Retrieve curriculum context and track actual days covered
    retrieved_context = ""
    try:
        from qdrant_client.http import models as qd_models
        must_not_filters = []
        for day in session.covered_days:
            must_not_filters.append(qd_models.FieldCondition(
                key="day",
                match=qd_models.MatchValue(value=day)
            ))
        
        query_filter = None
        if must_not_filters and len(session.covered_days) < 4:
            query_filter = qd_models.Filter(must_not=must_not_filters)

        results = qdrant.query(
            collection_name="ai_cohort_curriculum",
            query_text=search_query,
            query_filter=query_filter,
            limit=2
        )
        for res in results:
            retrieved_context += res.document + "\n\n"
            day = res.metadata.get('day')
            if day and day not in session.covered_days:
                session.covered_days.append(day)
    except Exception as e:
        print(f"Qdrant retrieval error: {e}")
        retrieved_context = "Could not retrieve curriculum context."
    
    # B9: If we haven't covered enough days yet, add a hint about uncovered topics
    uncovered_hint = ""
    if len(session.covered_days) < 4 and uncovered:
        uncovered_sample = list(uncovered)[:3]
        uncovered_hint = f"\nIMPORTANT: You have only covered days {session.covered_days}. Please ask about one of these uncovered days next: {uncovered_sample}."
    
    system_prompt = f"""You are an expert AI technical interviewer for the 'AI Cohort'.
You are interviewing {candidate.get('member', {}).get('name')} for the role of {candidate.get('member', {}).get('jobRole')}.
Candidate's weak or skipped topics: {', '.join(weak_topics) if weak_topics else 'None specific'}.

Relevant Curriculum Context for this question:
{retrieved_context}
{uncovered_hint}

CRITICAL RULES:
1. You MUST ask exactly 8 questions over the course of the interview. This is question {session.questions_asked + 1}.
2. You must cover at least 4 different curriculum days. Currently covered: {session.covered_days}.
3. Ask conversational, natural follow-up questions. Do not sound like a scripted questionnaire.
4. Keep your response brief. Only output your reply/question to the candidate, nothing else. No conversational filler like "Hello" if it's not the first message.
5. STRICTLY ASK ONLY ONE QUESTION. Do not ask multiple questions, do not ask multi-part questions, and do not request multiple pieces of information at once.
"""

    messages = [{"role": "system", "content": system_prompt}]
    for msg in session.conversation_history:
        messages.append({"role": msg['role'], "content": msg['content']})
        
    if latest_message:
        messages.append({"role": "user", "content": latest_message})
        
    try:
        response = client.chat.completions.create(
            model=NVIDIA_MODEL,
            messages=messages,
            temperature=0.7,
            max_completion_tokens=500
        )
        reply = response.choices[0].message.content.strip()
        session.questions_asked += 1
    except Exception as e:
        print(f"Error generating response: {e}")
        reply = "I apologize, but I am having trouble connecting to my backend right now. Could you tell me more about your experience with AI tools?"
    
    session.conversation_history.append({"role": "assistant", "content": reply})
    session.save()
    
    return reply

def evaluate_hackathon_interview(session):
    client = get_nvidia_client()
    
    system_prompt = """You are an expert technical evaluator. Review the interview transcript and provide a final evaluation.
Return EXACTLY this JSON structure:
{
  "summary": "<A 2-3 sentence summary of performance>",
  "strengths": ["<strength1>", "<strength2>"],
  "gaps": ["<gap1>", "<gap2>"],
  "next": ["<next_step1>", "<next_step2>"]
}
"""
    
    transcript = "\n".join([f"{msg['role']}: {msg['content']}" for msg in session.conversation_history])
    
    prompt = f"Interview Transcript:\n{transcript}\n\nEvaluate and return the JSON."
    
    try:
        response = client.chat.completions.create(
            model=NVIDIA_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        raw_text = response.choices[0].message.content.strip()
        return json.loads(raw_text)
    except Exception as e:
        return {
            "summary": "Evaluation could not be generated due to an error.",
            "strengths": [],
            "gaps": [],
            "next": []
        }
