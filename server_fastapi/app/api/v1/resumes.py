import uuid
import io
from typing import Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import pypdf

from app.api.deps import get_db, get_current_user
from app.db.models import Resume, User
from app.services import ai_service

router = APIRouter(prefix="/resumes", tags=["Resumes"])


MEDIA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "media" / "resumes"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

def _extract_text_from_file(filename: str, content: bytes) -> str:
    extracted_text = ""
    if filename.lower().endswith(".pdf"):
        try:
            reader = pypdf.PdfReader(io.BytesIO(content))
            pages_text = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            extracted_text = "\n".join(pages_text)
        except Exception as e:
            extracted_text = f"Resume PDF content for {filename}"
    else:
        extracted_text = content.decode("utf-8", errors="ignore")

    # STRICT RULE: Strip null bytes (0x00) for PostgreSQL UTF-8 compatibility
    cleaned_text = extracted_text.replace("\x00", "").strip()
    return cleaned_text[:5000] if cleaned_text else f"Resume file {filename}"

def _serialize_resume(r: Resume) -> dict:
    return {
        "id": str(r.id),
        "title": r.original_filename or "Resume",
        "original_filename": r.original_filename or "Resume",
        "file": r.file or "",
        "status": r.status or "uploaded",
        "extracted_text": r.extracted_text or "",
        "technical_skills": r.technical_skills if isinstance(r.technical_skills, list) else [],
        "soft_skills": r.soft_skills if isinstance(r.soft_skills, list) else [],
        "projects": r.projects if isinstance(r.projects, list) else [],
        "certifications": r.certifications if isinstance(r.certifications, list) else [],
        "education": r.education if isinstance(r.education, list) else [],
        "experience": r.experience if isinstance(r.experience, list) else [],
        "ats_score": r.ats_score if r.ats_score is not None else 75,
        "resume_rating": r.resume_rating if r.resume_rating is not None else 4.0,
        "missing_keywords": r.missing_keywords if isinstance(r.missing_keywords, list) else [],
        "missing_skills": r.missing_skills if isinstance(r.missing_skills, list) else [],
        "grammar_issues": r.grammar_issues if isinstance(r.grammar_issues, list) else [],
        "formatting_issues": r.formatting_issues if isinstance(r.formatting_issues, list) else [],
        "improvement_suggestions": r.improvement_suggestions if isinstance(r.improvement_suggestions, list) else [],
        "company_match_status": r.company_match_status or "Accept",
        "company_match_reason": r.company_match_reason or "Strong candidate profile.",
        "created_at": r.created_at.isoformat() if r.created_at else None
    }

@router.get("/")
async def list_resumes(
    limit: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc())
    if limit:
        stmt = stmt.limit(limit)

    res = await db.execute(stmt)
    resumes = res.scalars().all()
    return [_serialize_resume(r) for r in resumes]

@router.post("/upload/", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_id = uuid.uuid4()
    filename = f"{file_id}_{file.filename}"
    file_path = MEDIA_DIR / filename

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    extracted_text = _extract_text_from_file(file.filename, content)

    resume = Resume(
        id=file_id,
        user_id=current_user.id,
        file=f"resumes/{filename}",
        original_filename=file.filename,
        status="uploaded",
        extracted_text=extracted_text,
        technical_skills=[],
        soft_skills=[],
        projects=[],
        certifications=[],
        education=[],
        experience=[],
        ats_score=75,
        resume_rating=4.0,
        missing_keywords=[],
        missing_skills=[],
        grammar_issues=[],
        formatting_issues=[],
        improvement_suggestions=[],
        company_match_status="Accept",
        company_match_reason="Uploaded."
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)

    return _serialize_resume(resume)

@router.post("/{resume_id}/analyze/")
async def analyze_resume_endpoint(
    resume_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        r_uuid = uuid.UUID(resume_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid resume ID format.")

    res = await db.execute(select(Resume).where(Resume.id == r_uuid, Resume.user_id == current_user.id))
    resume = res.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    resume.status = "analyzing"
    await db.commit()

    # Trigger AI resume analysis via NVIDIA model
    analysis = ai_service.analyze_resume(resume.extracted_text or resume.original_filename)

    resume.status = "analyzed"
    resume.technical_skills = analysis.get("technical_skills") or []
    resume.soft_skills = analysis.get("soft_skills") or []
    resume.projects = analysis.get("projects") or []
    resume.certifications = analysis.get("certifications") or []
    resume.education = analysis.get("education") or []
    resume.experience = analysis.get("experience") or []
    resume.ats_score = int(analysis.get("ats_score", 75))
    resume.resume_rating = float(analysis.get("resume_rating", 4.0))
    resume.missing_keywords = analysis.get("missing_keywords") or []
    resume.missing_skills = analysis.get("missing_skills") or []
    resume.grammar_issues = analysis.get("grammar_issues") or []
    resume.formatting_issues = analysis.get("formatting_issues") or []
    resume.improvement_suggestions = analysis.get("improvement_suggestions") or []
    resume.company_match_status = analysis.get("company_match_status", "Accept")
    resume.company_match_reason = analysis.get("company_match_reason", "")

    await db.commit()
    await db.refresh(resume)

    return _serialize_resume(resume)
