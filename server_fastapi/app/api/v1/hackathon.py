import json
import uuid
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db
from app.db.models import HackathonSession
from app.services import ai_service

router = APIRouter(prefix="/api/interview", tags=["Hackathon Spec"])

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
CURRICULUM_FILE = DATA_DIR / "curriculum.json"
CANDIDATES_FILE = DATA_DIR / "candidates.json"

def load_curriculum() -> Dict[str, Any]:
    if CURRICULUM_FILE.exists():
        with open(CURRICULUM_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"curriculum": []}

def load_candidates() -> List[Dict[str, Any]]:
    if CANDIDATES_FILE.exists():
        with open(CANDIDATES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict) and "candidates" in data:
                return data["candidates"]
            elif isinstance(data, list):
                return data
    return []

@router.get("/curriculum/")
async def get_curriculum():
    return load_curriculum()

@router.get("/candidates/")
async def list_candidates():
    return load_candidates()

@router.get("/candidates/{candidate_id}")
async def get_candidate_detail(candidate_id: str):
    candidates = load_candidates()
    for cand in candidates:
        member = cand.get("member", {})
        if member.get("id") == candidate_id or cand.get("candidate_id") == candidate_id:
            return cand
    raise HTTPException(status_code=404, detail="Candidate not found")

@router.post("")
@router.post("/")
async def handle_hackathon_interview(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    session_id = payload.get("sessionId") or payload.get("session_id")
    candidate_obj = payload.get("candidate")
    user_message = payload.get("message")

    if not session_id:
        session_id = str(uuid.uuid4())

    res = await db.execute(
        select(HackathonSession).where(HackathonSession.session_id == session_id)
    )
    session = res.scalar_one_or_none()

    # Flow Step 1: Start Interview (session initialization or candidate object passed)
    if not session or candidate_obj is not None or user_message is None:
        if not candidate_obj:
            candidates = load_candidates()
            candidate_obj = candidates[0] if candidates else {"member": {"name": "Candidate"}}

        candidate_name = candidate_obj.get("member", {}).get("name", "Candidate")
        missions = candidate_obj.get("missions", [])
        
        # Pick topics from candidate missions
        first_question = ai_service.generate_interview_question(
            interview_type="hackathon_cohort",
            difficulty="medium",
            tech_stack=["RAG", "Vector Databases", "Prompt Engineering"],
            context=[{"role": "system", "content": f"Candidate: {candidate_name}. Completed missions: {len(missions)}"}],
            question_number=1,
            total_questions=8
        )
        if not first_question:
            first_question = f"Welcome {candidate_name}. Let's begin your 31-Day AI Cohort evaluation! To start off: Can you explain how you designed your Retrieval & Matching Engine during Mission 10?"

        init_data = {
            "candidate": candidate_obj,
            "questions": [{"question_number": 1, "day": 7, "question": first_question}],
            "evaluations": [],
            "final_report": None
        }

        if not session:
            session = HackathonSession(
                session_id=session_id,
                candidate_data=init_data,
                conversation_history=[{"role": "interviewer", "content": first_question}],
                questions_asked=1,
                is_done=False
            )
            db.add(session)
        else:
            session.candidate_data = init_data
            session.conversation_history = [{"role": "interviewer", "content": first_question}]
            session.questions_asked = 1
            session.is_done = False
            
        await db.commit()

        return {
            "reply": first_question,
            "done": False
        }

    # Flow Step 2 & 3: Conversation Turn / End Interview
    sess_data = dict(session.candidate_data or {})
    questions = list(sess_data.get("questions", []))
    evaluations = list(sess_data.get("evaluations", []))
    history = list(session.conversation_history or [])
    
    current_q_count = len(questions)

    # Log candidate message
    evaluations.append({
        "question_number": current_q_count,
        "answer": user_message
    })
    history.append({"role": "candidate", "content": user_message})
    sess_data["evaluations"] = evaluations

    # Check if 8 questions answered (End Interview Condition)
    if current_q_count >= 8:
        session.is_done = True
        feedback_report = {
            "summary": "Strong technical evaluation across 8 multi-turn interview questions. Demonstrated proficiency in RAG systems, vector search, and model context management.",
            "strengths": [
                "Solid grasp of Vector Database indexing (HNSW) and dense embeddings",
                "Clear communication of async FastAPI backend design and API contracts",
                "Effective prompt engineering and system directive constraints"
            ],
            "gaps": [
                "Could deepen understanding of ONNX INT8 model quantization techniques",
                "Advanced multi-agent orchestration fault tolerance"
            ],
            "next": [
                "Practice deploying quantization benchmarks using ONNX Runtime",
                "Implement end-to-end telemetry logging for LLM call latencies"
            ]
        }
        sess_data["final_report"] = feedback_report
        session.candidate_data = sess_data
        session.conversation_history = history
        await db.commit()

        return {
            "reply": "Interview completed. Thank you for demonstrating your technical knowledge throughout the 31-Day AI Cohort!",
            "done": True,
            "feedback": feedback_report
        }

    # Generate Next Question
    next_q_num = current_q_count + 1
    candidate_info = sess_data.get("candidate", {})
    candidate_name = candidate_info.get("member", {}).get("name", "Candidate") if isinstance(candidate_info, dict) else "Candidate"
    
    next_question = ai_service.generate_interview_question(
        interview_type="hackathon_cohort",
        difficulty="medium",
        tech_stack=["Agentic AI", "MCP Server", "FastAPI", "Vector Search"],
        context=[{"role": "user", "content": user_message}],
        question_number=next_q_num,
        total_questions=8
    )
    if not next_question:
        next_question = f"Great response, {candidate_name}. Moving on to Question {next_q_num}: How did you implement tool selection and context management in your multi-agent workflow?"

    questions.append({
        "question_number": next_q_num,
        "day": [7, 8, 12, 16, 22, 23, 28, 31][(next_q_num - 1) % 8],
        "question": next_question
    })
    history.append({"role": "interviewer", "content": next_question})
    
    sess_data["questions"] = questions
    session.candidate_data = sess_data
    session.conversation_history = history
    session.questions_asked = next_q_num
    
    await db.commit()

    return {
        "reply": next_question,
        "done": False
    }
