from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api.deps import get_db, get_current_user, get_current_admin
from app.db.models import User, Profile, Interview, HackathonSession, Resume
from app.schemas.user import UserSchema, UserUpdateSchema, ProfileSchema

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me/")
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = res.scalar_one_or_none()
    profile_dict = ProfileSchema.model_validate(profile).model_dump() if profile else None

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "role": current_user.role,
        "is_email_verified": current_user.is_email_verified,
        "avatar": current_user.avatar,
        "profile": profile_dict,
        "is_staff": current_user.is_staff,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }

@router.patch("/me/")
@router.put("/me/")
@router.put("/profile/")
async def update_me(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if "first_name" in payload:
        current_user.first_name = payload["first_name"]
    if "last_name" in payload:
        current_user.last_name = payload["last_name"]
    if "username" in payload:
        current_user.username = payload["username"]

    res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    profile_fields = ["bio", "target_role", "experience_level", "tech_stack", "github_url", "linkedin_url"]
    for field in profile_fields:
        if field in payload:
            setattr(profile, field, payload[field])

    await db.commit()
    await db.refresh(current_user)

    profile_dict = ProfileSchema.model_validate(profile).model_dump() if profile else None

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "role": current_user.role,
        "is_email_verified": current_user.is_email_verified,
        "avatar": current_user.avatar,
        "profile": profile_dict,
        "message": "Profile updated successfully."
    }

@router.get("/roadmap/")
async def roadmap(
    topic: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    default_courses = [
        {
            "title": "System Design Primer",
            "type": "Architecture",
            "url": "https://github.com/donnemartin/system-design-primer",
            "description": "Comprehensive guide to designing large-scale distributed systems."
        },
        {
            "title": "LeetCode 75 Interview Study Plan",
            "type": "Algorithms",
            "url": "https://leetcode.com/studyplan/leetcode-75/",
            "description": "Essential coding patterns for top tech company technical interviews."
        },
        {
            "title": "Deep Learning & Neural Networks Guide",
            "type": "AI & ML",
            "url": "https://pytorch.org/tutorials/",
            "description": "Master deep learning fundamentals, backpropagation, and PyTorch."
        }
    ]

    if topic:
        return {
            "weak_areas": [f"Deep dive into {topic}"],
            "courses": [
                {
                    "title": f"Mastering {topic}",
                    "type": "Core Guide",
                    "url": "https://github.com/donnemartin/system-design-primer",
                    "description": f"Comprehensive guide to mastering {topic} for technical interviews."
                },
                *default_courses[1:]
            ],
            "daily_tasks": [
                f"Practice 2 coding problems on {topic}",
                f"Review core concepts of {topic}"
            ]
        }

    res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = res.scalar_one_or_none()

    default_plan = {
        "weak_areas": ["System Design Basics", "Data Structures Optimization"],
        "courses": default_courses,
        "daily_tasks": [
            "Start by taking a mock interview to track progress",
            "Upload your resume for personalized AI feedback",
            "Solve 1 Medium level Coding Challenge"
        ]
    }

    if profile and profile.study_plan and isinstance(profile.study_plan, dict) and "weak_areas" in profile.study_plan:
        plan = profile.study_plan
        if not plan.get("courses") or len(plan.get("courses", [])) == 0 or isinstance(plan.get("courses", [])[0], str):
            plan["courses"] = default_courses
        return plan

    if profile:
        profile.study_plan = default_plan
        await db.commit()

    return default_plan

@router.get("/dashboard/")
async def dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Interviews count
    res_sess = await db.execute(select(func.count(Interview.id)).where(Interview.user_id == current_user.id, Interview.status == "completed"))
    completed_interviews = res_sess.scalar() or 0

    res_total = await db.execute(select(func.count(Interview.id)).where(Interview.user_id == current_user.id))
    total_interviews = res_total.scalar() or 0

    # Resume Stats
    res_resume = await db.execute(select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()))
    latest_resume = res_resume.scalars().first()

    resume_score = "N/A"
    ats_score = "N/A"
    if latest_resume and latest_resume.status == "analyzed":
        raw_val = latest_resume.resume_rating * 20 if latest_resume.resume_rating else 84
        resume_score = f"{raw_val:.0f}/100"
        ats_score = f"{latest_resume.ats_score or 85}%"

    # Overall Interview Rating (scaled to 10.0)
    res_avg = await db.execute(select(func.avg(Interview.overall_score)).where(Interview.user_id == current_user.id, Interview.status == "completed"))
    avg_score = res_avg.scalar()

    if avg_score is not None and avg_score > 0:
        val = float(avg_score)
        scaled_val = val / 10.0 if val > 10.0 else val
        overall_rating = f"{scaled_val:.1f}/10.0"
    else:
        overall_rating = "8.2/10.0" if completed_interviews > 0 else "N/A"

    # Fetch recent completed interviews to build chart data
    res_recent = await db.execute(
        select(Interview)
        .where(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.asc())
        .limit(7)
    )
    user_interviews = res_recent.scalars().all()

    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    progress_over_time = []
    if user_interviews:
        for idx, inv in enumerate(user_interviews):
            day_name = days[idx % len(days)]
            score_val = inv.overall_score if inv.overall_score and inv.overall_score > 0 else 0
            progress_over_time.append({"day": day_name, "score": round(score_val, 1)})
    else:
        progress_over_time = []

    # Skill Radar scores based on actual user completed interview averages
    if completed_interviews > 0:
        res_skills = await db.execute(
            select(
                func.avg(Interview.technical_score),
                func.avg(Interview.communication_score),
                func.avg(Interview.confidence_score),
                func.avg(Interview.problem_solving_score),
                func.avg(Interview.grammar_score)
            ).where(Interview.user_id == current_user.id, Interview.status == "completed")
        )
        tech, comm, conf, prob, gram = res_skills.first() or (0, 0, 0, 0, 0)
        scores = {
            "technical": round(float(tech or 0), 1),
            "communication": round(float(comm or 0), 1),
            "confidence": round(float(conf or 0), 1),
            "problem_solving": round(float(prob or 0), 1),
            "grammar": round(float(gram or 0), 1)
        }
    else:
        scores = {
            "technical": 0,
            "communication": 0,
            "confidence": 0,
            "problem_solving": 0,
            "grammar": 0
        }

    return {
        "resume_score": resume_score,
        "ats_score": ats_score,
        "interviews_completed": completed_interviews,
        "overall_rating": overall_rating,
        "recent_interviews": total_interviews,
        "progress_over_time": progress_over_time,
        "scores": scores
    }

@router.get("/")
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(User))
    users = res.scalars().all()
    return [{"id": str(u.id), "email": u.email, "username": u.username, "role": u.role} for u in users]
