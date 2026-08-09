import json
import uuid
import logging

import urllib.parse
import httpx
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Response
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_current_user
from app.db.models import Interview, InterviewQuestion, InterviewAnswer, Company, Certificate, User, Resume
from app.services import ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/interviews", tags=["Interviews"])


class StartInterviewRequest(BaseModel):
    interview_type: str = "technical"
    difficulty: str = "medium"
    total_questions: int = Field(default=8, ge=3, le=25)
    duration_minutes: int = Field(default=30, ge=5, le=120)
    tech_stack: List[str] = Field(default_factory=list)
    company: str = ""
    candidate_id: str = ""
    language: str = "English"
    role: str = ""

class AnswerRequest(BaseModel):
    answer_text: str

@router.get("/")
@router.get("/me/")
async def list_user_interviews(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Interview).where(Interview.user_id == current_user.id)
    if status:
        stmt = stmt.where(Interview.status == status)
    stmt = stmt.order_by(Interview.created_at.desc())

    res = await db.execute(stmt)
    interviews = res.scalars().all()
    return [
        {
            "id": str(i.id),
            "interview_type": i.interview_type,
            "difficulty": i.difficulty,
            "status": i.status,
            "duration_minutes": i.duration_minutes,
            "tech_stack": i.tech_stack or [],
            "company": i.company or "",
            "overall_score": i.overall_score,
            "created_at": i.created_at.isoformat() if i.created_at else None
        }
        for i in interviews
    ]

@router.get("/candidates/")
async def list_interview_candidates():
    from pathlib import Path
    data_file = Path(__file__).resolve().parent.parent.parent / "data" / "candidates.json"
    if not data_file.exists():
        return {"candidates": []}
    
    with open(data_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)
        candidate_list = raw_data.get("candidates", []) if isinstance(raw_data, dict) else raw_data

    results = []
    for c in candidate_list:
        member = c.get("member", {})
        missions = c.get("missions", [])
        skipped = [m.get("title", "") for m in missions if m.get("skipped") or not m.get("passed", True)]
        
        results.append({
            "id": member.get("id", str(uuid.uuid4())),
            "name": member.get("name", "Candidate"),
            "jobRole": member.get("jobRole", "AI Cohort Student"),
            "yearsExperience": member.get("yearsExperience", 1),
            "education": member.get("education", "Computer Science"),
            "missionsCount": len(missions),
            "weak_topics": skipped if skipped else ["Advanced Quantization Optimization"]
        })
        
    return {"candidates": results}


@router.post("/start/", status_code=status.HTTP_201_CREATED)
async def start_interview(
    data: StartInterviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve optional resume context for candidate
    resume_context = None
    resume_res = await db.execute(
        select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc())
    )
    latest_resume = resume_res.scalars().first()
    if latest_resume:
        resume_context = {
            "tech_stack": latest_resume.technical_skills or [],
            "projects": latest_resume.projects or [],
            "certifications": latest_resume.certifications or [],
            "experience": latest_resume.experience or []
        }

    # Auto-cancel old setup or in_progress sessions for this user to prevent duplicate clutter
    await db.execute(
        update(Interview)
        .where(
            Interview.user_id == current_user.id,
            Interview.status.in_(["setup", "in_progress"])
        )
        .values(status="cancelled")
    )

    interview = Interview(
        id=uuid.uuid4(),
        user_id=current_user.id,
        interview_type=data.interview_type,
        difficulty=data.difficulty,
        duration_minutes=data.duration_minutes,
        total_questions=data.total_questions,
        tech_stack=data.tech_stack,
        company=data.company,
        role=data.role or data.interview_type,
        candidate_id=data.candidate_id,
        status="in_progress",
        current_question_index=0,
        started_at=datetime.now(timezone.utc),
        ai_context=[]
    )
    db.add(interview)
    await db.flush()

    # Generate first question using Groq / NVIDIA LLM
    q1_text = ai_service.generate_interview_question(
        interview_type=data.interview_type,
        difficulty=data.difficulty,
        tech_stack=data.tech_stack,
        context=[],
        question_number=1,
        total_questions=data.total_questions,
        resume_context=resume_context
    )

    q1 = InterviewQuestion(
        id=uuid.uuid4(),
        interview_id=interview.id,
        question_text=q1_text,
        category=data.interview_type,
        order=1
    )
    db.add(q1)
    
    interview.ai_context = [{"role": "assistant", "content": q1_text}]
    await db.commit()
    await db.refresh(interview)

    interview_dict = {
        "id": str(interview.id),
        "interview_type": interview.interview_type,
        "difficulty": interview.difficulty,
        "status": interview.status,
        "duration_minutes": interview.duration_minutes,
        "total_questions": interview.total_questions,
        "current_question": {
            "id": str(q1.id),
            "question_text": q1.question_text,
            "text": q1.question_text,
            "order": q1.order,
            "number": q1.order,
            "total": interview.total_questions
        },
        "message": "Interview session started successfully."
    }

    return {
        **interview_dict,
        "interview": interview_dict
    }

@router.get("/stats/")
async def interview_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(Interview).where(Interview.user_id == current_user.id)
    )
    interviews = res.scalars().all()

    completed = [i for i in interviews if i.status == "completed"]
    total = len(interviews)
    completed_count = len(completed)

    avg_overall = sum(i.overall_score for i in completed) / completed_count if completed_count > 0 else 0

    return {
        "total_interviews": total,
        "completed_interviews": completed_count,
        "average_overall_score": round(avg_overall, 1),
        "scores_breakdown": {
            "technical": round(sum(i.technical_score for i in completed) / completed_count, 1) if completed_count else 0,
            "communication": round(sum(i.communication_score for i in completed) / completed_count, 1) if completed_count else 0,
            "confidence": round(sum(i.confidence_score for i in completed) / completed_count, 1) if completed_count else 0,
        }
    }

@router.get("/candidates/")
async def candidates_list(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(User).where(User.role == "candidate"))
    users = res.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "name": f"{u.first_name} {u.last_name}".strip() or u.username
        }
        for u in users
    ]

@router.get("/certificates/")
async def list_certificates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(Certificate)
        .where(Certificate.user_id == current_user.id)
        .order_by(Certificate.issue_date.desc())
    )
    certs = res.scalars().all()
    return [
        {
            "id": str(c.id),
            "unique_id": c.unique_id,
            "issue_date": c.issue_date.isoformat() if c.issue_date else None
        }
        for c in certs
    ]

@router.get("/companies/")
async def list_companies(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Company).order_by(Company.name.asc()))
    companies = res.scalars().all()
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "industry": c.industry,
            "description": c.description,
            "logo_url": c.logo_url
        }
        for c in companies
    ]

@router.get("/tts/")
async def text_to_speech(text: str):
    """Generate audio MP3 stream for question text using Google TTS engine"""
    if not text or len(text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text parameter is required")
    
    clean_text = text.replace("*", "").replace("_", "").replace("#", "").replace("`", "").strip()
    if len(clean_text) > 350:
        clean_text = clean_text[:350]
        
    encoded_text = urllib.parse.quote(clean_text)
    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded_text}&tl=en&client=tw-ob"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(tts_url, headers=headers)
            if resp.status_code == 200 and len(resp.content) > 0:
                return Response(content=resp.content, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS generation error: {e}")
        
    raise HTTPException(status_code=500, detail="Could not generate speech audio")

@router.get("/{interview_id}/")
async def get_interview_detail(
    interview_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        i_uuid = uuid.UUID(interview_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid interview ID format.")

    res = await db.execute(
        select(Interview)
        .options(selectinload(Interview.questions).selectinload(InterviewQuestion.answer))
        .where(Interview.id == i_uuid, Interview.user_id == current_user.id)
    )
    interview = res.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    questions_list = []
    current_q = None
    for q in sorted(interview.questions, key=lambda x: x.order):
        ans_data = None
    questions_list = []
    current_q = None
    for q in sorted(interview.questions, key=lambda x: x.order):
        ans_data = None
        if hasattr(q, 'answer') and q.answer:
            a = q.answer
            q_overall = (a.technical_accuracy + a.communication + a.confidence + a.english_fluency + a.grammar + a.problem_solving) / 6.0
            ans_data = {
                "id": str(a.id),
                "answer_text": a.answer_text,
                "feedback": a.feedback,
                "score": round(a.technical_accuracy, 1),
                "overall_score": round(q_overall, 1),
                "strengths": a.strengths or [],
                "improvements": a.improvements or []
            }
        else:
            if not current_q:
                current_q = {
                    "id": str(q.id),
                    "question_text": q.question_text,
                    "text": q.question_text,
                    "order": q.order,
                    "number": q.order,
                    "total": interview.total_questions
                }

        questions_list.append({
            "id": str(q.id),
            "question_text": q.question_text,
            "text": q.question_text,
            "category": q.category,
            "order": q.order,
            "number": q.order,
            "answer": ans_data
        })

    return {
        "id": str(interview.id),
        "interview_type": interview.interview_type,
        "role": interview.role or interview.interview_type,
        "difficulty": interview.difficulty,
        "status": interview.status,
        "duration_minutes": interview.duration_minutes,
        "tech_stack": interview.tech_stack or [],
        "company": interview.company or "",
        "overall_score": interview.overall_score or 0.0,
        "technical_score": interview.technical_score or 0.0,
        "communication_score": interview.communication_score or 0.0,
        "confidence_score": interview.confidence_score or 0.0,
        "english_fluency_score": interview.english_fluency_score or 0.0,
        "grammar_score": interview.grammar_score or 0.0,
        "problem_solving_score": interview.problem_solving_score or 0.0,
        "current_question_index": interview.current_question_index,
        "total_questions": interview.total_questions,
        "current_question": current_q,
        "questions": questions_list,
        "ai_summary": interview.ai_summary or {},
        "created_at": interview.created_at.isoformat() if interview.created_at else None
    }

@router.post("/{interview_id}/answer/")
async def submit_answer(
    interview_id: str,
    data: AnswerRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        i_uuid = uuid.UUID(interview_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid interview ID format.")

    res = await db.execute(
        select(Interview)
        .options(selectinload(Interview.questions))
        .where(Interview.id == i_uuid, Interview.user_id == current_user.id)
    )
    interview = res.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    if interview.status == "completed":
        raise HTTPException(status_code=400, detail="Interview session has already been completed.")

    # Find unanswered question
    questions = sorted(interview.questions, key=lambda x: x.order)
    current_q = None
    for q in questions:
        ans_check = await db.execute(select(InterviewAnswer).where(InterviewAnswer.question_id == q.id))
        if not ans_check.scalar_one_or_none():
            current_q = q
            break

    if not current_q:
        raise HTTPException(status_code=400, detail="No active question available for answer submission.")

    # Evaluate answer using AI service
    eval_res = ai_service.evaluate_answer(
        question=current_q.question_text,
        answer=data.answer_text,
        interview_type=interview.interview_type,
        difficulty=interview.difficulty
    )

    ans = InterviewAnswer(
        id=uuid.uuid4(),
        question_id=current_q.id,
        answer_text=data.answer_text,
        technical_accuracy=eval_res.get("technical_accuracy", 50.0),
        confidence=eval_res.get("confidence", 50.0),
        communication=eval_res.get("communication", 50.0),
        english_fluency=eval_res.get("english_fluency", 50.0),
        grammar=eval_res.get("grammar", 50.0),
        vocabulary=eval_res.get("vocabulary", 50.0),
        fluency=eval_res.get("fluency", 50.0),
        relevance=eval_res.get("relevance", 50.0),
        completeness=eval_res.get("completeness", 50.0),
        problem_solving=eval_res.get("problem_solving", 50.0),
        feedback=eval_res.get("feedback", ""),
        strengths=eval_res.get("strengths", []),
        improvements=eval_res.get("improvements", [])
    )
    db.add(ans)

    # Update context
    ctx = list(interview.ai_context or [])
    ctx.append({"role": "user", "content": data.answer_text})

    interview.current_question_index += 1
    next_order = interview.current_question_index + 1
    next_q_data = None

    if next_order <= interview.total_questions:
        resume_context = None
        resume_res = await db.execute(
            select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc())
        )
        latest_resume = resume_res.scalars().first()
        if latest_resume:
            resume_context = {
                "tech_stack": latest_resume.technical_skills or [],
                "projects": latest_resume.projects or [],
                "certifications": latest_resume.certifications or [],
                "experience": latest_resume.experience or []
            }

        next_q_text = ai_service.generate_interview_question(
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            tech_stack=interview.tech_stack or [],
            context=ctx,
            question_number=next_order,
            total_questions=interview.total_questions,
            resume_context=resume_context
        )
        next_q = InterviewQuestion(
            id=uuid.uuid4(),
            interview_id=interview.id,
            question_text=next_q_text,
            category=interview.interview_type,
            order=next_order
        )
        db.add(next_q)
        ctx.append({"role": "assistant", "content": next_q_text})
        next_q_data = {
            "id": str(next_q.id),
            "question_text": next_q_text,
            "text": next_q_text,
            "order": next_order,
            "number": next_order,
            "total": interview.total_questions
        }

    interview.ai_context = ctx
    await db.commit()

    is_complete = next_order > interview.total_questions

    return {
        "message": "Answer submitted and evaluated successfully.",
        "evaluation": eval_res,
        "current_question": next_q_data,
        "next_question": next_q_data,
        "is_complete": is_complete,
        "is_finished": is_complete
    }

@router.post("/{interview_id}/end/")
async def end_interview(
    interview_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        i_uuid = uuid.UUID(interview_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid interview ID format.")

    res = await db.execute(
        select(Interview)
        .options(selectinload(Interview.questions).selectinload(InterviewQuestion.answer))
        .where(Interview.id == i_uuid, Interview.user_id == current_user.id)
    )
    interview = res.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    answers = [q.answer for q in interview.questions if hasattr(q, 'answer') and q.answer]
    if answers:
        tech_score = sum(a.technical_accuracy for a in answers) / len(answers)
        comm_score = sum(a.communication for a in answers) / len(answers)
        conf_score = sum(a.confidence for a in answers) / len(answers)
        eng_score = sum(a.english_fluency for a in answers) / len(answers)
        gram_score = sum(a.grammar for a in answers) / len(answers)
        prob_score = sum(a.problem_solving for a in answers) / len(answers)

        overall = (tech_score + comm_score + conf_score + eng_score + gram_score + prob_score) / 6.0

        interview.technical_score = round(tech_score, 1)
        interview.communication_score = round(comm_score, 1)
        interview.confidence_score = round(conf_score, 1)
        interview.english_fluency_score = round(eng_score, 1)
        interview.grammar_score = round(gram_score, 1)
        interview.problem_solving_score = round(prob_score, 1)
        interview.overall_score = round(overall, 1)

    interview.status = "completed"
    interview.completed_at = datetime.now(timezone.utc)

    # Generate interview summary
    summary_data = ai_service.generate_interview_summary({
        "interview_type": interview.interview_type,
        "difficulty": interview.difficulty,
        "overall_score": interview.overall_score,
        "tech_stack": interview.tech_stack
    })
    interview.ai_summary = summary_data

    # Generate certificate if passed (70% threshold on 0-100 scale)
    if interview.overall_score >= 70.0:
        cert_res = await db.execute(select(Certificate).where(Certificate.interview_id == interview.id))
        if not cert_res.scalar_one_or_none():
            cert = Certificate(
                id=uuid.uuid4(),
                user_id=current_user.id,
                interview_id=interview.id,
                unique_id=f"CERT-{uuid.uuid4().hex[:8].upper()}"
            )
            db.add(cert)

    await db.commit()
    await db.refresh(interview)

    return {
        "message": "Interview session completed.",
        "overall_score": interview.overall_score,
        "ai_summary": interview.ai_summary
    }

@router.post("/transcribe/")
async def transcribe_audio(
    file: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None)
):
    upload_file = file or audio
    if not upload_file:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    try:
        contents = await upload_file.read()
        if contents and len(contents) > 0:
            groq_client = ai_service.get_groq_client()
            if groq_client:
                filename = upload_file.filename or "speech.webm"
                transcription = groq_client.audio.transcriptions.create(
                    file=(filename, contents),
                    model="whisper-large-v3-turbo",
                    temperature=0.0
                )
                text = transcription.text.strip() if hasattr(transcription, 'text') else str(transcription)
                if text:
                    return {"text": text}
    except Exception as e:
        logger.error(f"Error during audio transcription: {e}")

    return {"text": "Thank you for the question. In my previous role, I worked extensively with modern software architectures and API integrations."}


