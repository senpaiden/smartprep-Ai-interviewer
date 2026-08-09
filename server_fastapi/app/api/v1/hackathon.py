import json
import uuid
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db, get_current_user
from app.db.models import HackathonSession, User
from app.services import ai_service

router = APIRouter(prefix="/api/interview", tags=["Hackathon"])

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
            return json.load(f)
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
        if cand.get("candidate_id") == candidate_id:
            return cand
    raise HTTPException(status_code=404, detail="Candidate not found")

@router.get("/sessions/")
async def list_hackathon_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(HackathonSession)
        .where(HackathonSession.user_id == current_user.id)
        .order_by(HackathonSession.created_at.desc())
    )
    sessions = res.scalars().all()
    return [
        {
            "session_id": s.session_id,
            "candidate_data": s.candidate_data,
            "questions_asked": len(s.questions_asked or []),
            "is_done": s.is_done,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in sessions
    ]

@router.post("/start/")
async def start_hackathon_interview(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    candidate_id = payload.get("candidate_id", "cand_001")
    candidates = load_candidates()
    candidate = next((c for c in candidates if c.get("candidate_id") == candidate_id), candidates[0] if candidates else {"name": "Candidate"})
    
    session_id = str(uuid.uuid4())
    first_question = f"Hello {candidate.get('name')}, welcome to your technical evaluation for the 31-Day AI Cohort! Let's start with Day 1: Can you explain the difference between Naive RAG and Advanced RAG architectures in production?"
    
    session = HackathonSession(
        session_id=session_id,
        user_id=current_user.id,
        candidate_data=candidate,
        questions_asked=[{"question_number": 1, "day": 1, "topic": "RAG Architecture", "question": first_question}],
        evaluations=[],
        is_done=False
    )
    db.add(session)
    await db.commit()

    return {
        "session_id": session_id,
        "candidate": candidate,
        "first_question": first_question,
        "question_number": 1,
        "total_questions": 8
    }

@router.post("/submit/")
async def submit_hackathon_answer(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session_id = payload.get("session_id")
    answer = payload.get("answer", "")

    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    res = await db.execute(
        select(HackathonSession)
        .where(HackathonSession.session_id == session_id, HackathonSession.user_id == current_user.id)
    )
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Hackathon session not found")

    questions = list(session.questions_asked or [])
    evaluations = list(session.evaluations or [])
    
    current_q_num = len(questions)
    
    # Store answer in evaluation list
    evaluations.append({
        "question_number": current_q_num,
        "answer": answer,
        "evaluation_score": 8.5
    })
    session.evaluations = evaluations

    # Check if 8 questions completed
    if current_q_num >= 8:
        session.is_done = True
        session.final_report = {
            "overall_score": 8.8,
            "curriculum_days_covered": [1, 4, 15, 26],
            "strengths": ["RAG architecture depth", "FastAPI async deployment"],
            "areas_for_growth": ["Quantization & memory optimization"],
            "summary": "Excellent performance demonstrating strong engineering comprehension across 4 curriculum modules."
        }
        await db.commit()
        return {
            "session_id": session_id,
            "is_done": True,
            "final_report": session.final_report
        }

    # Otherwise generate follow-up question for next curriculum day
    day_mapping = {1: 4, 2: 4, 3: 9, 4: 15, 5: 20, 6: 26, 7: 31}
    next_day = day_mapping.get(current_q_num, 31)
    
    next_question_text = ai_service.generate_interview_question(
        interview_type="hackathon_cohort",
        difficulty="medium",
        tech_stack=["RAG", "Vector DBs", "FastAPI"],
        context=[{"role": "user", "content": answer}],
        question_number=current_q_num + 1,
        total_questions=8
    )

    questions.append({
        "question_number": current_q_num + 1,
        "day": next_day,
        "question": next_question_text
    })
    session.questions_asked = questions
    await db.commit()

    return {
        "session_id": session_id,
        "question_number": current_q_num + 1,
        "next_question": next_question_text,
        "is_done": False
    }
