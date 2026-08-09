from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.database import engine, Base
import app.db.models  # Register all models with Base.metadata

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.interviews import router as interviews_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.hackathon import router as hackathon_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="High-performance async-native FastAPI backend for SmartPrep",
    version="1.0.0",
    lifespan=lifespan
)

# Compression Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers (Primary /api prefix)
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(interviews_router, prefix="/api")
app.include_router(resumes_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(hackathon_router, prefix="/api")

# Direct fallback mounts (Without /api prefix)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(interviews_router)
app.include_router(resumes_router)
app.include_router(notifications_router)
app.include_router(hackathon_router)




@app.get("/")
async def root():
    return {
        "status": "online",
        "framework": "FastAPI",
        "message": "SmartPrep High-Performance API Server",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
