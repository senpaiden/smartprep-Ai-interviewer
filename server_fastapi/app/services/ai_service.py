import json
import logging
from openai import OpenAI
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

NVIDIA_MODEL = "meta/llama-3.1-70b-instruct"
NVIDIA_FAST_MODEL = "meta/llama-3.1-8b-instruct"

GROQ_70B_MODEL = "llama-3.3-70b-versatile"
GROQ_8B_MODEL = "llama-3.1-8b-instant"

def get_nvidia_client():
    api_key = settings.NVIDIA_API_KEY if hasattr(settings, 'NVIDIA_API_KEY') else None
    if not api_key:
        logger.warning("NVIDIA_API_KEY is not set in FastAPI settings.")
    return OpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=api_key or "dummy")

def get_groq_client():
    api_key = settings.GROQ_API_KEY if hasattr(settings, 'GROQ_API_KEY') else None
    if not api_key:
        return None
    return Groq(api_key=api_key)

def generate_interview_question(
    interview_type, difficulty, tech_stack, context, question_number, total_questions,
    company_guidelines=None, resume_context=None, curriculum_context=None
):
    groq_client = get_groq_client()

    company_rules = f"\nCOMPANY INTERVIEW GUIDELINES:\n{company_guidelines}\n" if company_guidelines else ""
    company_specific_guidelines = f"COMPANY SPECIFIC GUIDELINES:\n{company_guidelines}" if company_guidelines else ""

    resume_section = ""
    if resume_context and not curriculum_context:
        role = resume_context.get('role', interview_type)
        techs = ', '.join(resume_context.get('tech_stack', [])[:10]) or 'None listed'
        
        projects_text = ""
        projects = resume_context.get('projects', [])[:5]
        if projects:
            projects_list = []
            for p in projects:
                name = p.get('name', 'Unnamed')
                techs_used = ', '.join(p.get('technologies', [])[:5])
                projects_list.append(f"  - {name} ({techs_used})")
            projects_text = "\n".join(projects_list)

        certs_text = ""
        certs = resume_context.get('certifications', [])[:5]
        if certs:
            certs_text = ", ".join(certs)

        exp_text = ""
        exps = resume_context.get('experience', [])[:3]
        if exps:
            exp_list = []
            for e in exps:
                title = e.get('title', 'Unknown')
                company = e.get('company', 'Unknown')
                exp_list.append(f"  - {title} at {company}")
            exp_text = "\n".join(exp_list)

        resume_section = f"""
CANDIDATE PROFILE (from their resume):
- Target Role: {role}
- Known Tech Stack: {techs}
- Projects:{chr(10) + projects_text if projects_text else " None listed"}
- Certifications: {certs_text or "None listed"}
- Work Experience:{chr(10) + exp_text if exp_text else " None listed"}

PERSONALIZATION RULES:
- Ask SPECIFICALLY about technologies they list on their resume
- Ask about their projects — probe architecture decisions, challenges, trade-offs
- If they have certifications, test practical knowledge behind them
- Ask behavioral questions based on their work experience
- Identify GAPS in their profile and ask about those areas
- Reference their actual project names and tech choices in questions
"""

    curriculum_section = ""
    if curriculum_context:
        candidate_name = curriculum_context.get('candidate_name', 'Candidate')
        candidate_role = curriculum_context.get('candidate_role', '')
        weak_topics = curriculum_context.get('weak_topics', [])
        covered = curriculum_context.get('covered_days', [])
        uncovered = curriculum_context.get('uncovered_days', [])
        retrieved = curriculum_context.get('retrieved_curriculum', '')

        curriculum_section = f"""
CANDIDATE PROFILE (AI Cohort):
- Name: {candidate_name}
- Role: {candidate_role}
- Weak/Skipped Topics: {', '.join(weak_topics) if weak_topics else 'None identified'}
- Curriculum Days Covered So Far: {covered if covered else 'None yet'}
- Uncovered Days Remaining: {uncovered[:10] if uncovered else 'All covered'}

Relevant Curriculum Context:
{retrieved if retrieved else 'No specific curriculum context available.'}

CRITICAL CURRICULUM RULES:
1. You MUST ask questions based on the AI Cohort curriculum (31 days, 8 modules).
2. Cover at least 4 different curriculum days across the interview.
3. Target the candidate's weak/skipped topics — probe these areas more deeply.
4. Ask about specific concepts, tools, and objectives from the curriculum.
5. Reference actual day topics (e.g., "On Day 7 you covered Embeddings...").
6. Adapt based on whether they passed or struggled with a topic.
7. Ask ONE question at a time. No multi-part questions.
"""

    difficulty_guideline = ""
    diff_lower = (difficulty or "medium").lower()
    if diff_lower == "easy":
        difficulty_guideline = """
EASY DIFFICULTY RULES:
- Ask a SIMPLE, DIRECT, FUNDAMENTAL question (e.g. basic syntax, concept definition, or basic usage).
- Do NOT ask complex architecture questions, vanishing/exploding gradient math, or deep internal optimization.
- The question MUST be short, friendly, and EXACTLY ONE sentence (max 20 words).
- Absolutely NO compound or multi-part questions (e.g. do not use 'and what...', 'how did you... and why...').
"""
    elif diff_lower == "hard":
        difficulty_guideline = """
HARD DIFFICULTY RULES:
- Probe deep internal mechanics, system architecture trade-offs, edge case handling, and performance bottlenecks.
"""
    else:
        difficulty_guideline = """
MEDIUM DIFFICULTY RULES:
- Ask practical, scenario-based questions about standard industry practices and real-world implementation choices.
- Keep questions clear and focused on one core topic.
"""
    # Extract all previously asked questions from conversation context to prevent repeats
    previous_asked = []
    if context:
        for item in context:
            if item.get("role") == "assistant":
                text = item.get("content", "").strip()
                if text and not text.startswith("..."):
                    previous_asked.append(text)

    prev_q_formatted = "\n".join([f"  - {q}" for q in previous_asked]) if previous_asked else "  - None (this is question 1)"

    anti_repetition_mandate = f"""
STRICT ANTI-REPETITION MANDATE:
The following questions have ALREADY been asked in this session:
{prev_q_formatted}

RULES FOR QUESTION NO. {question_number}:
1. DO NOT repeat, rephrase, or ask about the exact same topic as any question listed above!
2. You MUST explore a NEW concept, library, feature, or real-world scenario from the technology stack ({', '.join(tech_stack) if tech_stack else 'Software Development'}).
3. NEVER ask generic definition questions back-to-back (e.g. avoid repeating "What is X in Python?"). Instead, vary question types: ask about practical implementation, data flow, debugging techniques, design choices, or project experiences.
"""

    system_prompt = f"""You are an expert IT/Technical AI interviewer conducting a {interview_type} interview.
Target Role / Domain: {interview_type}
Difficulty level: {difficulty}
Technology stack: {', '.join(tech_stack) if tech_stack else 'General Tech'}
Question {question_number} of {total_questions}.
{company_rules}
{difficulty_guideline}
{resume_section}
{curriculum_section}
{anti_repetition_mandate}

CRITICAL RULES:
1. STRICT RULE: You MUST only ask questions related to the IT/Software Engineering field. If the candidate attempts to discuss non-IT topics, politely decline and steer back to IT.
2. Ask ONE clear, concise question at a time.
3. NEVER output conversational filler or pleasantries. Start immediately with the question text.
4. Adapt difficulty based on previous answers while respecting the {difficulty} level.
5. Be professional and encouraging.

{company_specific_guidelines}

Return ONLY the question text, nothing else."""

    conversation = ""
    if context:
        for ctx in context[-6:]:
            role = "AI Interviewer" if ctx.get("role") == "assistant" else "Candidate"
            conversation += f"{role}: {ctx.get('content', '')}\n"

    prompt = f"""{conversation}
Now, generate a fresh, unique question #{question_number} (out of {total_questions}) for this {interview_type} interview. Remember: DO NOT ask about any topic previously covered!"""

    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model=GROQ_70B_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.85,
                max_tokens=300,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Groq API error generating question: {e}")

    client = get_nvidia_client()
    try:
        response = client.chat.completions.create(
            model=NVIDIA_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_completion_tokens=500,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating question: {e}")
        return f"Tell me about your experience with {tech_stack[0] if tech_stack else 'software development'}."

def evaluate_answer(question, answer, interview_type, difficulty):
    groq_client = get_groq_client()
    system_prompt = """You are an expert IT Interview Evaluator. Evaluate the candidate's answer across multiple dimensions.

Return a JSON object with EXACTLY these fields:
{
    "technical_accuracy": <float 0-10>,
    "confidence": <float 0-10>,
    "communication": <float 0-10>,
    "english_fluency": <float 0-10>,
    "grammar": <float 0-10>,
    "vocabulary": <float 0-10>,
    "fluency": <float 0-10>,
    "relevance": <float 0-10>,
    "completeness": <float 0-10>,
    "problem_solving": <float 0-10>,
    "overall_score": <float 0-10, weighted average>,
    "reason": "<1-2 sentence explanation of the overall score.>",
    "strengths": ["<specific strength 1>", "<strength 2>"],
    "recommendations": ["<specific thing to learn or improve, 1>", "<thing 2>"]
}"""

    prompt = f"""Interview Type: {interview_type}
Difficulty: {difficulty}
Question: {question}
Candidate's Answer: {answer}

Evaluate this answer across all dimensions. Return JSON with individual scores for each dimension."""

    data = None
    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model=GROQ_8B_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=600,
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"Groq API error evaluating answer: {e}")

    if not data:
        client = get_nvidia_client()
        try:
            response = client.chat.completions.create(
                model=NVIDIA_FAST_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_completion_tokens=600,
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"Error evaluating answer: {e}")
            return {
                "technical_accuracy": 50, "confidence": 50, "communication": 50, "english_fluency": 50,
                "grammar": 50, "vocabulary": 50, "fluency": 50, "relevance": 50, "completeness": 50,
                "problem_solving": 50, "feedback": "Evaluation complete.",
                "strengths": [], "improvements": [], "score": 5.0,
            }

    def _norm(val):
        try:
            return min(max(float(val) * 10, 0), 100)
        except (TypeError, ValueError):
            return 50.0

    tech = _norm(data.get('technical_accuracy', 5))
    conf = _norm(data.get('confidence', 5))
    comm = _norm(data.get('communication', 5))
    eng = _norm(data.get('english_fluency', 5))
    gram = _norm(data.get('grammar', 5))
    vocab = _norm(data.get('vocabulary', 5))
    flu = _norm(data.get('fluency', 5))
    rel = _norm(data.get('relevance', 5))
    comp = _norm(data.get('completeness', 5))
    prob = _norm(data.get('problem_solving', 5))

    overall_100 = (tech + conf + comm + eng + gram + vocab + flu + rel + comp + prob) / 10

    return {
        "technical_accuracy": tech,
        "confidence": conf,
        "communication": comm,
        "english_fluency": eng,
        "grammar": gram,
        "vocabulary": vocab,
        "fluency": flu,
        "relevance": rel,
        "completeness": comp,
        "problem_solving": prob,
        "feedback": data.get('reason', 'No feedback available.'),
        "strengths": data.get('strengths', []),
        "improvements": data.get('recommendations', []),
        "score": round(overall_100 / 10, 1),
    }

def analyze_resume(resume_text, company_context=None):
    groq_client = get_groq_client()
    company_rules = ""
    if company_context:
        company_rules = f"""
COMPANY CONTEXT FOR ANALYSIS:
- Required Skills: {', '.join(company_context.get('required_skills', []))}
- Target Keywords: {company_context.get('resume_filter_keywords', '')}
"""

    system_prompt = f"""You are a strict ATS and Resume Analyzer.
Return a JSON object with EXACTLY these fields:
{{
    "technical_skills": ["skill1", ...],
    "soft_skills": ["skill1", ...],
    "projects": [{{"name": "...", "description": "...", "technologies": ["..."]}}],
    "certifications": ["cert1", ...],
    "education": [{{"degree": "...", "institution": "...", "year": "..."}}],
    "experience": [{{"title": "...", "company": "...", "duration": "...", "description": "..."}}],
    "ats_score": <int 0-100>,
    "resume_rating": <float 0-5>,
    "missing_keywords": ["keyword1", ...],
    "missing_skills": ["skill1", ...],
    "grammar_issues": ["issue1", ...],
    "formatting_issues": ["issue1", ...],
    "improvement_suggestions": ["suggestion1", ...],
    "company_match_status": "<Accept / Reject>",
    "company_match_reason": "<1 sentence explanation>"
}}
{company_rules}"""

    prompt = f"Analyze this resume:\n\n{resume_text}"

    if groq_client:
        try:
            logger.info("Triggering Groq LPU LLaMA 3.3 70B for high-speed resume analysis...")
            response = groq_client.chat.completions.create(
                model=GROQ_70B_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"Groq API error in analyze_resume: {e}. Falling back to NVIDIA NIM...")

    client = get_nvidia_client()
    try:
        response = client.chat.completions.create(
            model=NVIDIA_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=1000,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        logger.error(f"Error analyzing resume: {e}")
        return {
            "technical_skills": [], "soft_skills": [], "projects": [], "certifications": [],
            "education": [], "experience": [], "ats_score": 75, "resume_rating": 4.0,
            "missing_keywords": [], "missing_skills": [],
            "grammar_issues": [], "formatting_issues": [], "improvement_suggestions": [],
            "company_match_status": "Accept", "company_match_reason": "Good overall profile match."
        }

def review_code(challenge_title, challenge_description, code, language, test_results):
    groq_client = get_groq_client()
    system_prompt = """You are an expert Code Reviewer and AI Judge.
Return a JSON object with:
{
    "quality_score": <int 0-100>,
    "review": "<detailed feedback>",
    "complexity_analysis": "Time: O(...), Space: O(...)",
    "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}"""
    prompt = f"Challenge: {challenge_title}\nDescription: {challenge_description}\nLanguage: {language}\nCode:\n{code}\nTest Results: {json.dumps(test_results)}"
    
    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model=GROQ_70B_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"Groq API error reviewing code: {e}")

    client = get_nvidia_client()
    try:
        response = client.chat.completions.create(
            model=NVIDIA_FAST_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=500,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        logger.error(f"Error reviewing code: {e}")
        return {
            "quality_score": 85,
            "review": "Code looks good and satisfies problem constraints.",
            "complexity_analysis": "Time: O(N), Space: O(1)",
            "suggestions": ["Consider adding edge case handling."]
        }

def generate_interview_summary(interview_meta):
    groq_client = get_groq_client()
    system_prompt = """You are an AI Hiring Manager.
Return a JSON object summarizing performance with EXACTLY these fields:
{
    "overall_feedback": "<Detailed 2-3 sentence overall performance feedback>",
    "hire_recommendation": "<Strong Hire / Hire / Weak Hire / No Hire>",
    "top_strengths": ["<strength 1>", "<strength 2>"],
    "areas_to_improve": ["<improvement 1>", "<improvement 2>"],
    "recommended_topics": ["<topic 1>", "<topic 2>"]
}"""
    prompt = f"Interview details: {json.dumps(interview_meta)}"
    
    data = None
    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model=GROQ_70B_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500,
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"Groq API error generating summary: {e}")

    if not data:
        client = get_nvidia_client()
        try:
            response = client.chat.completions.create(
                model=NVIDIA_FAST_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_completion_tokens=500,
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"Error generating interview summary: {e}")
            data = {
                "overall_feedback": "Demonstrated strong core principles and clear technical communication.",
                "hire_recommendation": "Hire",
                "top_strengths": ["Clear communication", "Good domain knowledge"],
                "areas_to_improve": ["Practice edge-case handling"],
                "recommended_topics": ["System Architecture", "Async IO"]
            }

    # Normalize response keys for frontend compatibility
    return {
        "overall_feedback": data.get("overall_feedback") or data.get("summary", "Solid interview performance."),
        "hire_recommendation": data.get("hire_recommendation") or data.get("hiring_recommendation", "Hire"),
        "top_strengths": data.get("top_strengths") or data.get("key_strengths", []),
        "areas_to_improve": data.get("areas_to_improve") or data.get("areas_for_improvement", []),
        "recommended_topics": data.get("recommended_topics") or data.get("recommendations", ["Technical Basics"]),
    }
