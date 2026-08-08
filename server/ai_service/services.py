"""AI Service - NVIDIA LLM integration for interview and resume analysis."""

import json
import logging
from django.conf import settings
from openai import OpenAI

logger = logging.getLogger(__name__)

# We use the versatile LLaMA 3.1 model via NVIDIA API for all generations.
NVIDIA_MODEL = "meta/llama-3.1-70b-instruct"
NVIDIA_FAST_MODEL = "meta/llama-3.1-8b-instruct"


def get_nvidia_client():
    """Get an OpenAI client instance pointing to NVIDIA."""
    if not getattr(settings, 'NVIDIA_API_KEY', None):
        logger.error("NVIDIA_API_KEY is not set.")
    return OpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=settings.NVIDIA_API_KEY)


def generate_interview_question(interview_type, difficulty, tech_stack, context, question_number, total_questions, company_guidelines=None, resume_context=None, curriculum_context=None):
    """Generate the next interview question using AI."""
    client = get_nvidia_client()

    company_rules = f"\nCOMPANY INTERVIEW GUIDELINES:\n{company_guidelines}\n" if company_guidelines else ""
    company_specific_guidelines = f"COMPANY SPECIFIC GUIDELINES:\n{company_guidelines}" if company_guidelines else ""

    # Build resume context section for personalized questions
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

    # Build curriculum context section for cohort-based interviews
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

    system_prompt = f"""You are an expert IT/Technical AI interviewer conducting a {interview_type} interview.
Difficulty level: {difficulty}
Technology stack: {', '.join(tech_stack) if tech_stack else 'General Tech'}
Question {question_number} of {total_questions}.
{company_rules}
{resume_section}
{curriculum_section}

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
    """Evaluate a candidate's answer using AI (fast model for speed)."""
    client = get_nvidia_client()

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
    "reason": "<1-2 sentence explanation of the overall score. Be specific about what was good or missing.>",
    "strengths": ["<specific strength 1>", "<strength 2>"],
    "recommendations": ["<specific thing to learn or improve, 1>", "<thing 2>", "<thing 3>"]
}

SCORING DIMENSIONS:
- technical_accuracy: How correct and detailed are the technical concepts?
- confidence: How confident and decisive does the candidate sound?
- communication: How well-structured and clear is the explanation?
- english_fluency: How fluent is the English (natural flow, no awkward phrasing)?
- grammar: How correct is the grammar (tenses, articles, prepositions)?
- vocabulary: How varied and appropriate is the word choice?
- fluency: How smoothly do they articulate without excessive hesitation?
- relevance: How directly does the answer address the question?
- completeness: How thoroughly does the answer cover the topic?
- problem_solving: How well do they demonstrate analytical/creative thinking?

SCORING GUIDE (per dimension):
- 9-10: Exceptional
- 7-8: Strong
- 5-6: Average
- 3-4: Below average
- 1-2: Poor
- 0: No relevant content

RULES:
- Be strict but fair. Most answers should be 5-7.
- Each dimension MUST have a different score based on its specific evaluation — do NOT copy the same score everywhere.
- strengths must be SPECIFIC (e.g., "Explained the React reconciliation process clearly" not "Good answer").
- recommendations must be SPECIFIC and ACTIONABLE (e.g., "Study React useEffect cleanup patterns" not "Learn React").
- Return ONLY valid JSON, no markdown."""

    prompt = f"""Interview Type: {interview_type}
Difficulty: {difficulty}
Question: {question}
Candidate's Answer: {answer}

Evaluate this answer across all dimensions. Return JSON with individual scores for each dimension."""

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

        raw_text = response.choices[0].message.content.strip()
        data = json.loads(raw_text)

        def _norm(val):
            """Normalize a 0-10 score to 0-100, clamping to valid range."""
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
    except Exception as e:
        logger.error(f"Error evaluating answer: {e}")
        return {
            "technical_accuracy": 0, "confidence": 0, "communication": 0, "english_fluency": 0,
            "grammar": 0, "vocabulary": 0, "fluency": 0, "relevance": 0, "completeness": 0,
            "problem_solving": 0, "feedback": "Unable to evaluate. Please try again.",
            "strengths": [], "improvements": [], "score": 0,
        }


def analyze_resume(resume_text, company_context=None):
    """Analyze a resume using AI."""
    client = get_nvidia_client()

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
            model=NVIDIA_FAST_MODEL,
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
    """Generate a summary report for a completed interview (fast model)."""
    client = get_nvidia_client()

    system_prompt = """You are an expert Tech Career Coach. Generate a concise interview performance summary.

Return a JSON object:
{
    "overall_feedback": "<2-3 sentence summary of performance. Be specific about what went well and what needs work.>",
    "top_strengths": ["<strength1>", "<strength2>", "<strength3>"],
    "areas_to_improve": ["<area1>", "<area2>", "<area3>"],
    "recommended_topics": ["<specific topic 1>", "<specific topic 2>", "<specific topic 3>"],
    "overall_score": <int 0-100>,
    "hire_recommendation": "<Strong Hire / Hire / Maybe / No Hire>"
}

RULES:
- Be honest and direct. Don't sugarcoat poor performance.
- recommended_topics must be SPECIFIC (e.g., "React useEffect cleanup" not "Learn React").
- Return ONLY valid JSON, no markdown."""

    prompt = f"Generate a summary for this interview:\n\n{json.dumps(interview_data)}"

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

        raw_text = response.choices[0].message.content.strip()
            
        return json.loads(raw_text)
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return {
            "overall_feedback": "Unable to generate summary.", "top_strengths": [],
            "areas_to_improve": [], "recommended_topics": [], "overall_score": 0,
            "hire_recommendation": "Unable to evaluate",
        }


def review_code(challenge_title, challenge_description, code, language, test_results):
    """Review a coding submission using AI and return structured feedback."""
    client = get_nvidia_client()

    system_prompt = """You are a senior software engineer reviewing a coding challenge submission.
Analyze the code for correctness, efficiency, readability, and best practices.

Return a JSON object with EXACTLY these fields:
{
    "review": "<2-4 sentence overall review of the code quality and correctness>",
    "suggestions": ["<specific improvement suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
    "quality_score": <int 0-100>,
    "time_complexity": "<e.g. O(n), O(n log n), O(n^2)>",
    "space_complexity": "<e.g. O(1), O(n), O(n^2)>"
}

RULES:
- quality_score should reflect: correctness (40%), efficiency (25%), readability (20%), best practices (15%).
- suggestions must be SPECIFIC and ACTIONABLE (e.g., "Use a hash map instead of nested loops to reduce time complexity to O(n)" not "Make it faster").
- Be direct and constructive. Point out both strengths and weaknesses.
- Return ONLY valid JSON, no markdown."""

    results_summary = ""
    if test_results:
        passed = sum(1 for r in test_results if r.get('passed'))
        total = len(test_results)
        results_summary = f"\nTest Results: {passed}/{total} tests passed."
        for i, r in enumerate(test_results[:5], 1):
            status = "PASS" if r.get('passed') else "FAIL"
            results_summary += f"\n  Test {i}: {status}"

    prompt = f"""Challenge: {challenge_title}
Description: {challenge_description}
Language: {language}

Code:
```{language}
{code}
```
{results_summary}

Review this submission and return JSON with review, suggestions, quality_score, time_complexity, and space_complexity."""

    try:
        response = client.chat.completions.create(
            model=NVIDIA_FAST_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_completion_tokens=600,
            response_format={"type": "json_object"}
        )

        raw_text = response.choices[0].message.content.strip()
        data = json.loads(raw_text)

        quality_score = data.get('quality_score', 0)
        try:
            quality_score = min(max(int(quality_score), 0), 100)
        except (TypeError, ValueError):
            quality_score = 0

        time_c = data.get('time_complexity', 'Unknown')
        space_c = data.get('space_complexity', 'Unknown')
        complexity = f"Time: {time_c}, Space: {space_c}"

        return {
            "review": data.get('review', 'No review available.'),
            "suggestions": data.get('suggestions', []),
            "quality_score": quality_score,
            "time_complexity": time_c,
            "space_complexity": space_c,
            "complexity_analysis": complexity,
        }
    except Exception as e:
        logger.error(f"Error reviewing code: {e}")
        return {
            "review": "Unable to generate review at this time.",
            "suggestions": [],
            "quality_score": 0,
            "time_complexity": "Unknown",
            "space_complexity": "Unknown",
            "complexity_analysis": "Unknown",
        }


def generate_embedding_text(text):
    """Clean and trim text for embedding. Truncates to 500 chars max."""
    if not text:
        return ''
    cleaned = ' '.join(text.split())
    return cleaned[:500]


def generate_roadmap(topic):
    """Generate a learning roadmap for a specific topic."""
    client = get_nvidia_client()

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
            model=NVIDIA_MODEL,
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
