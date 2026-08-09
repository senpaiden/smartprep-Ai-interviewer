import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db, get_current_user
from app.db.models import HackathonSession, User
from app.services import ai_service

router = APIRouter(prefix="/api/interview", tags=["Hackathon"])

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
            "questions_asked": s.questions_asked,
            "is_done": s.is_done,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in sessions
    ]

@router.get("/sessions/{session_id}/")
async def get_hackathon_session_detail(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(HackathonSession)
        .where(HackathonSession.session_id == session_id, HackathonSession.user_id == current_user.id)
    )
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Hackathon session not found.")

    return {
        "session_id": session.session_id,
        "candidate_data": session.candidate_data,
        "questions_asked": session.questions_asked,
        "evaluations": session.evaluations,
        "final_report": session.final_report,
        "is_done": session.is_done,
        "created_at": session.created_at.isoformat() if session.created_at else None
    }

@router.get("/candidates/")
async def list_hackathon_candidates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(HackathonSession))
    sessions = res.scalars().all()
    return [
        {
            "session_id": s.session_id,
            "candidate": s.candidate_data.get("name", "Unknown") if isinstance(s.candidate_data, dict) else "Candidate",
            "is_done": s.is_done
        }
        for s in sessions
    ]

@router.post("")
@router.post("/")
async def chat_hackathon(
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session_id = payload.get("session_id")
    user_msg = payload.get("message", "")

    if not session_id:
        session_id = str(uuid.uuid4())

    res = await db.execute(select(HackathonSession).where(HackathonSession.session_id == session_id))
    session = res.scalar_one_or_none()

    if not session:
        session = HackathonSession(
            session_id=session_id,
            user_id=current_user.id,
            candidate_data={"name": "Alex Tech"},
            questions_asked=[],
            evaluations=[],
            is_done=False
        )
        db.add(session)

    questions = list(session.questions_asked or [])
    if user_msg:
        questions.append({"role": "interviewer", "text": user_msg})

    # AI candidate response
    reply_text = ai_service.generate_interview_question(
        interview_type="hackathon_candidate",
        difficulty="medium",
        tech_stack=["Python", "System Design"],
        context=[{"role": "user", "content": user_msg}],
        question_number=len(questions) + 1,
        total_questions=5
    )

    questions.append({"role": "candidate", "text": reply_text})
    session.questions_asked = questions

    await db.commit()

    return {
        "session_id": session_id,
        "reply": reply_text,
        "is_done": session.is_done
    }
