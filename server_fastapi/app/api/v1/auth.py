import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
)
from app.db.models import User, Profile
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest, ForgotPasswordRequest, QuickLoginRequest
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register/", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if data.password != data.password_confirm:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    res_email = await db.execute(select(User).where(User.email == data.email))
    if res_email.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered.")

    res_user = await db.execute(select(User).where(User.username == data.username))
    if res_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken.")

    user_id = uuid.uuid4()
    hashed = get_password_hash(data.password)
    user = User(
        id=user_id,
        email=data.email,
        username=data.username,
        password=hashed,
        first_name=data.first_name or "",
        last_name=data.last_name or "",
        role="candidate",
        is_active=True
    )
    db.add(user)
    await db.flush()

    profile = Profile(
        id=uuid.uuid4(),
        user_id=user.id,
        phone="",
        bio="",
        education=[],
        experience=[],
        skills=[],
        social_links={},
        study_plan={},
        profile_completion=0
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))

    profile_dict = {
        "phone": "",
        "bio": "",
        "education": [],
        "experience": [],
        "skills": [],
        "social_links": {},
        "profile_completion": 0
    }

    user_dict = {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "is_email_verified": user.is_email_verified,
        "avatar": user.avatar,
        "profile": profile_dict,
        "is_staff": user.is_staff,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

    return {
        "message": "Account created successfully.",
        "user": user_dict,
        "tokens": {
            "access": access,
            "refresh": refresh
        }
    }

@router.post("/login/")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == data.email))
    user = res.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled.")

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))

    profile_res = await db.execute(select(Profile).where(Profile.user_id == user.id))
    profile = profile_res.scalar_one_or_none()

    profile_dict = {
        "phone": profile.phone if profile else "",
        "bio": profile.bio if profile else "",
        "education": profile.education if profile else [],
        "experience": profile.experience if profile else [],
        "skills": profile.skills if profile else [],
        "social_links": profile.social_links if profile else {},
        "profile_completion": profile.profile_completion if profile else 0
    }

    user_dict = {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "is_email_verified": user.is_email_verified,
        "avatar": user.avatar,
        "profile": profile_dict,
        "is_staff": user.is_staff,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

    return {
        "message": "Login successful.",
        "user": user_dict,
        "tokens": {
            "access": access,
            "refresh": refresh
        }
    }

@router.post("/refresh/")
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh)
    if not payload or payload.get("token_type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token.")

    user_id_str = payload.get("sub")
    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    res = await db.execute(select(User).where(User.id == user_uuid))
    user = res.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive.")

    new_access = create_access_token(str(user.id))
    new_refresh = create_refresh_token(str(user.id))

    return {
        "access": new_access,
        "refresh": new_refresh
    }

@router.post("/forgot-password/")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    return {"message": "If an account with that email exists, a reset link has been sent."}

@router.post("/quick-login")
@router.post("/quick-login/")
async def quick_login(data: QuickLoginRequest, db: AsyncSession = Depends(get_db)):

    res = await db.execute(select(User).where(User.email == data.email))
    user = res.scalar_one_or_none()

    if not user:
        uname = data.username or data.email.split('@')[0]
        res_uname = await db.execute(select(User).where(User.username == uname))
        if res_uname.scalar_one_or_none():
            uname = f"{uname}_{uuid.uuid4().hex[:4]}"

        name_parts = (data.name or "").strip().split(" ", 1)
        first_name = name_parts[0] if len(name_parts) > 0 else "Candidate"
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        user = User(
            id=uuid.uuid4(),
            email=data.email,
            username=uname,
            password=get_password_hash("quicklogin123"),
            first_name=first_name,
            last_name=last_name,
            role="candidate",
            is_active=True
        )
        db.add(user)
        await db.flush()

        profile = Profile(
            id=uuid.uuid4(),
            user_id=user.id,
            phone="",
            bio="",
            education=[],
            experience=[],
            skills=[],
            social_links={},
            study_plan={},
            profile_completion=80
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))

    profile_res = await db.execute(select(Profile).where(Profile.user_id == user.id))
    profile = profile_res.scalar_one_or_none()

    user_dict = {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "is_email_verified": True,
        "avatar": user.avatar,
        "profile": {
            "phone": profile.phone if profile else "",
            "bio": profile.bio if profile else "",
            "education": profile.education if profile else [],
            "experience": profile.experience if profile else [],
            "skills": profile.skills if profile else [],
            "social_links": profile.social_links if profile else {},
            "profile_completion": profile.profile_completion if profile else 80
        },
        "is_staff": user.is_staff,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

    return {
        "message": "Login successful.",
        "user": user_dict,
        "tokens": {
            "access": access,
            "refresh": refresh
        }
    }
