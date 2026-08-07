"""AI Service - Groq LLM integration for interview and resume analysis."""

import json
import logging
from django.conf import settings
# pyrefly: ignore [missing-import]
from groq import Groq

logger = logging.getLogger(__name__)

# We use the versatile LLaMA 3.3 model for all generations on Groq.
GROQ_MODEL = "llama-3.3-70b-versatile"


def get_groq_client():
    """Get a Groq client instance."""
    if not settings.GROQ_API_KEY:
        logger.error("GROQ_API_KEY is not set.")
    return Groq(api_key=settings.GROQ_API_KEY)


def generate_interview_question(interview_type, difficulty, tech_stack, context, question_number, total_questions, company_guidelines=None):
    """Generate the next interview question using AI."""
    client = get_groq_client()

    company_rules = f"\nCOMPANY INTERVIEW GUIDELINES:\n{company_guidelines}\n" if company_guidelines else ""
    company_specific_guidelines = f"COMPANY SPECIFIC GUIDELINES:\n{company_guidelines}" if company_guidelines else ""

    system_prompt = f"""You are an expert IT/Technical AI interviewer conducting a {interview_type} interview.
Difficulty level: {difficulty}
Technology stack: {', '.join(tech_stack) if tech_stack else 'General Tech'}
Question {question_number} of {total_questions}.
{company_rules}

CRITICAL RULES:
1. STRICT RULE: You MUST only ask questions related to the IT/Software Engineering field. If the candidate attempts to discuss non-IT topics (like mechanics, cooking, etc.), politely decline and steer the conversation back to IT/Tech.
2. Ask ONE clear, specific question at a time.
3. NEVER output conversational filler, pleasantries (like "Hello", "Sure", "Let's begin"). Start immediately with the question text.
4. Adapt difficulty based on previous answers.
5. Ask follow-up questions when answers are incomplete.
6. Be professional and encouraging.
7. For technical interviews, ask hands-on coding/system design questions.
8. For behavioral interviews, use STAR method questions.

{company_specific_guidelines}

Return ONLY the question text, nothing else."""

    conversation = ""
    if context:
        for ctx in context[-6:]:
            role = "AI Interviewer" if ctx.get("role") == "assistant" else "Candidate"
            conversation += f"{role}: {ctx.get('content', '')}\n"

    prompt = f"""{conversation}
Now, generate question {question_number} for this {interview_type} interview."""

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
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
    """Evaluate a candidate's answer using AI."""
    client = get_groq_client()

    system_prompt = """You are an expert Senior IT Recruiter and Interview Evaluator. Evaluate the candidate's answer.

Return a JSON object with EXACTLY these fields (scores 0-100):
{
    "technical_accuracy": <int>,
    "confidence": <int>,
    "communication": <int>,
    "english_fluency": <int>,
    "grammar": <int>,
    "vocabulary": <int>,
    "fluency": <int>,
    "relevance": <int>,
    "completeness": <int>,
    "problem_solving": <int>,
    "feedback": "<detailed feedback string>",
    "strengths": ["<strength1>", "<strength2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
}

GRADING RUBRIC:
- Be strict. Do not give 90+ unless the answer is exceptional.
- Deduct points for hesitation, filler words, or beating around the bush.
Return ONLY valid JSON without markdown formatting like ```json."""

    prompt = f"""Interview Type: {interview_type}
Difficulty: {difficulty}
Question: {question}
Candidate's Answer: {answer}

Evaluate this answer and return the JSON evaluation."""

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=1000,
            response_format={"type": "json_object"}
        )
        
        raw_text = response.choices[0].message.content.strip()
        
        return json.loads(raw_text)
    except Exception as e:
        logger.error(f"Error evaluating answer: {e}")
        return {
            "technical_accuracy": 0, "confidence": 0, "communication": 0, "english_fluency": 0,
            "grammar": 0, "vocabulary": 0, "fluency": 0, "relevance": 0, "completeness": 0,
            "problem_solving": 0, "feedback": "Unable to evaluate. Please try again.",
            "strengths": [], "improvements": [],
        }


def analyze_resume(resume_text, company_context=None):
    """Analyze a resume using AI."""
    client = get_groq_client()

    company_rules = ""
    if company_context:
        company_rules = f"""
COMPANY CONTEXT FOR ANALYSIS:
- Required Skills: {', '.join(company_context.get('required_skills', []))}
- Target Keywords: {company_context.get('resume_filter_keywords', '')}
You must strictly evaluate if this candidate meets the company requirements.
If they lack major required skills, drop their ATS score significantly.
"""

    system_prompt = f"""You are a strict, top-tier Tech Company ATS (Applicant Tracking System) and Resume Analyzer.

Analyze the resume and return a JSON object with EXACTLY these fields:
{{
    "technical_skills": ["skill1", ...], // Extracted tech skills
    "soft_skills": ["skill1", ...],
    "projects": [{{"name": "...", "description": "...", "technologies": ["..."]}}],
    "certifications": ["cert1", ...],
    "education": [{{"degree": "...", "institution": "...", "year": "..."}}],
    "experience": [{{"title": "...", "company": "...", "duration": "...", "description": "..."}}],
    "ats_score": <int 0-100>, // Score strictly on impact metrics, action verbs, and keyword density.
    "resume_rating": <float 0-5>, 
    "missing_keywords": ["keyword1", ...], // Important tech keywords missing for their role
    "missing_skills": ["skill1", ...],
    "grammar_issues": ["issue1", ...],
    "formatting_issues": ["issue1", ...],
    "improvement_suggestions": ["suggestion1", ...], // Concrete advice (e.g., "Add metrics to project X")
    "company_match_status": "<Accept / Reject>", // Based on the COMPANY CONTEXT below
    "company_match_reason": "<1 sentence explaining why accepted or rejected>"
}}

RULES:
- Do NOT hallucinate. If a section is missing (e.g., Experience), leave the array empty.
- Be very critical. A good ATS score requires quantifiable achievements (e.g., "Improved latency by 20%").
- Return ONLY valid JSON, no markdown formatting.
{company_rules}"""

    prompt = f"Analyze this resume:\n\n{resume_text}"

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        raw_text = response.choices[0].message.content.strip()
        
        return json.loads(raw_text)
    except Exception as e:
        logger.error(f"Error analyzing resume: {e}")
        return {
            "technical_skills": [], "soft_skills": [], "projects": [], "certifications": [],
            "education": [], "experience": [], "ats_score": 0, "resume_rating": 0.0,
            "missing_keywords": [], "missing_skills": [],
            "grammar_issues": ["Unable to analyze - please try again"],
            "formatting_issues": [], "improvement_suggestions": [],
            "company_match_status": "Reject",
            "company_match_reason": "Analysis failed."
        }


def generate_interview_summary(interview_data):
    """Generate a summary report for a completed interview."""
    client = get_groq_client()

    system_prompt = """You are an expert Tech Career Coach and Hiring Manager. Generate a final interview performance summary based strictly on the provided interview evaluation data.

Return a JSON object:
{
    "overall_feedback": "<2-3 paragraph summary focusing on tech skills, communication, and problem-solving. Do NOT hallucinate topics not discussed.>",
    "top_strengths": ["<strength1>", "<strength2>", "<strength3>"],
    "areas_to_improve": ["<area1>", "<area2>", "<area3>"],
    "recommended_topics": ["<topic1>", "<topic2>", "<topic3>"], // Specific tech topics to study
    "overall_score": <int 0-100>, // Calculated based on the data
    "hire_recommendation": "<Strong Hire / Hire / Maybe / No Hire>" // Strict hiring bar
}

Return ONLY valid JSON without markdown."""

    prompt = f"Generate a summary for this interview:\n\n{json.dumps(interview_data)}"

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=1000,
            response_format={"type": "json_object"}
        )

        raw_text = response.choices[0].message.content.strip()
            
        return json.loads(raw_text)
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return {
            "overall_feedback": "Unable to generate summary.", "top_strengths": [],
            "areas_to_improve": [], "recommended_topics": [], "overall_score": 0,
            "hire_recommendation": "Unable to evaluate",
        }


def generate_roadmap(topic):
    """Generate a learning roadmap for a specific topic."""
    client = get_groq_client()

    system_prompt = """You are a Senior Staff Engineer and Technical Career Coach.
Generate a comprehensive, actionable, day-by-day learning roadmap for the given tech topic.

Return a JSON object with EXACTLY these fields:
{
    "weak_areas": ["<Key concept 1>", "<Key concept 2>", "<Key concept 3>"],
    "courses": [
        {"title": "<Actual, well-known resource (e.g., 'React Docs', 'FreeCodeCamp')>", "url": "https://...", "type": "<Course / Book / Tutorial>"}
    ],
    "daily_tasks": [
        "Day 1: <Highly specific actionable task e.g., 'Build a counter app using useState'>", 
        "Day 2: <Highly specific actionable task>", 
        "Day 3: <Highly specific actionable task>"
    ]
}

RULES:
- Ensure daily_tasks are realistic and hands-on (coding focused, not just reading).
- Ensure courses are real industry-standard resources.
- Return ONLY valid JSON without markdown formatting."""

    prompt = f"Create a structured learning roadmap for: {topic}"

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=1000,
            response_format={"type": "json_object"}
        )

        raw_text = response.choices[0].message.content.strip()
        return json.loads(raw_text)
    except Exception as e:
        logger.error(f"Error generating roadmap: {e}")
        return {
            "weak_areas": ["Fundamentals of " + topic, "Advanced " + topic + " Concepts", "Practical Implementation"],
            "courses": [
                {"title": f"Mastering {topic}", "url": "#", "type": "Course"},
                {"title": f"The Complete Guide to {topic}", "url": "#", "type": "Book"}
            ],
            "daily_tasks": [
                f"Read 1 article about {topic} best practices",
                f"Build a small project using {topic}",
                "Review code and optimize for performance"
            ]
        }
