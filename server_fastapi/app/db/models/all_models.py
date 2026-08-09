import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, Text, DateTime, ForeignKey, JSON, UUID
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "accounts_user"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    password = Column(String(128), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    is_superuser = Column(Boolean, default=False)
    username = Column(String(150), unique=True, nullable=False)
    first_name = Column(String(150), default="")
    last_name = Column(String(150), default="")
    email = Column(String(254), unique=True, nullable=False)
    is_staff = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    date_joined = Column(DateTime(timezone=True), default=utc_now)
    role = Column(String(20), default="candidate")
    is_email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String(255), nullable=True)
    password_reset_token = Column(String(255), nullable=True)
    password_reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    avatar = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    submissions = relationship("CodingSubmission", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "accounts_profile"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("accounts_user.id", ondelete="CASCADE"), unique=True, nullable=False)
    phone = Column(String(20), default="")
    bio = Column(Text, default="")
    education = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    skills = Column(JSON, default=list)
    social_links = Column(JSON, default=dict)
    study_plan = Column(JSON, default=dict)
    profile_completion = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")


class Company(Base):
    __tablename__ = "interviews_company"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    logo_url = Column(String(200), default="")
    industry = Column(String(100), default="")
    description = Column(Text, default="")
    required_skills = Column(JSON, default=list)
    resume_filter_keywords = Column(Text, default="")
    interview_guidelines = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    interview_sets = relationship("CompanyInterviewSet", back_populates="company", cascade="all, delete-orphan")


class CompanyInterviewSet(Base):
    __tablename__ = "interviews_companyinterviewset"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("interviews_company.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    round_type = Column(String(50), nullable=False)
    difficulty = Column(String(20), default="medium")
    questions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    company = relationship("Company", back_populates="interview_sets")


class Interview(Base):
    __tablename__ = "interviews_interview"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("accounts_user.id", ondelete="CASCADE"), nullable=False)
    interview_type = Column(String(30), nullable=False)
    difficulty = Column(String(10), default="medium")
    status = Column(String(20), default="setup")

    duration_minutes = Column(Integer, default=30)
    total_questions = Column(Integer, default=10)
    language = Column(String(50), default="English")
    tech_stack = Column(JSON, default=list)
    company = Column(String(100), default="")
    role = Column(String(100), default="")
    candidate_id = Column(String(50), default="")
    covered_days = Column(JSON, default=list)

    overall_score = Column(Float, default=0.0)
    technical_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    english_fluency_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    grammar_score = Column(Float, default=0.0)
    problem_solving_score = Column(Float, default=0.0)

    ai_context = Column(JSON, default=list)
    ai_summary = Column(JSON, default=dict)
    current_question_index = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    recording_url = Column(String(200), default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interviews_interviewquestion"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews_interview.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(20), default="technical")
    order = Column(Integer, default=0)
    is_follow_up = Column(Boolean, default=False)
    expected_answer_points = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    interview = relationship("Interview", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")


class InterviewAnswer(Base):
    __tablename__ = "interviews_interviewanswer"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("interviews_interviewquestion.id", ondelete="CASCADE"), unique=True, nullable=False)
    answer_text = Column(Text, nullable=False)

    technical_accuracy = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    communication = Column(Float, default=0.0)
    english_fluency = Column(Float, default=0.0)
    grammar = Column(Float, default=0.0)
    vocabulary = Column(Float, default=0.0)
    fluency = Column(Float, default=0.0)
    relevance = Column(Float, default=0.0)
    completeness = Column(Float, default=0.0)
    problem_solving = Column(Float, default=0.0)

    feedback = Column(Text, default="")
    strengths = Column(JSON, default=list)
    improvements = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    question = relationship("InterviewQuestion", back_populates="answer")


class Certificate(Base):
    __tablename__ = "interviews_certificate"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("accounts_user.id", ondelete="CASCADE"), nullable=False)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews_interview.id", ondelete="CASCADE"), unique=True, nullable=False)
    unique_id = Column(String(50), unique=True, nullable=False)
    issue_date = Column(DateTime(timezone=True), default=utc_now)


class Resume(Base):
    __tablename__ = "resumes_resume"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("accounts_user.id", ondelete="CASCADE"), nullable=False)
    file = Column(String(100), nullable=False)
    original_filename = Column(String(255), nullable=False)
    status = Column(String(20), default="uploaded")

    extracted_text = Column(Text, default="")
    technical_skills = Column(JSON, default=list)
    soft_skills = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    education = Column(JSON, default=list)
    experience = Column(JSON, default=list)

    ats_score = Column(Integer, default=0)
    resume_rating = Column(Float, default=0.0)

    missing_keywords = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    grammar_issues = Column(JSON, default=list)
    formatting_issues = Column(JSON, default=list)
    improvement_suggestions = Column(JSON, default=list)

    company_match_status = Column(String(50), default="")
    company_match_reason = Column(Text, default="")

    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="resumes")


class CodingChallenge(Base):
    __tablename__ = "coding_codingchallenge"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(10), nullable=False)
    frequency = Column(String(10), default="practice")
    category = Column(String(20), default="other")
    tags = Column(JSON, default=list)
    time_limit_ms = Column(Integer, default=2000)
    memory_limit_kb = Column(Integer, default=262144)
    starter_code = Column(JSON, default=dict)
    public_test_cases = Column(JSON, default=list)
    hidden_test_cases = Column(JSON, default=list)
    solution_code = Column(Text, default="")
    solution_explanation = Column(Text, default="")
    hints = Column(JSON, default=list)
    total_submissions = Column(Integer, default=0)
    accepted_submissions = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    submissions = relationship("CodingSubmission", back_populates="challenge", cascade="all, delete-orphan")


class CodingSubmission(Base):
    __tablename__ = "coding_codingsubmission"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("accounts_user.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("coding_codingchallenge.id", ondelete="CASCADE"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String(20), nullable=False)
    status = Column(String(20), default="pending")
    execution_time_ms = Column(Integer, nullable=True)
    memory_used_kb = Column(Integer, nullable=True)
    test_results = Column(JSON, default=list)
    total_tests = Column(Integer, default=0)
    passed_tests = Column(Integer, default=0)
    stdout = Column(Text, default="")
    stderr = Column(Text, default="")
    compile_output = Column(Text, default="")
    ai_review = Column(Text, default="")
    code_quality_score = Column(Integer, default=0)
    complexity_analysis = Column(String(50), default="")
    optimization_suggestions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="submissions")
    challenge = relationship("CodingChallenge", back_populates="submissions")


class Notification(Base):
    __tablename__ = "notifications_notification"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("accounts_user.id", ondelete="CASCADE"), nullable=False)
    notification_type = Column(String(30), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), default="")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="notifications")


class HackathonSession(Base):
    __tablename__ = "hackathon_hackathonsession"

    session_id = Column(String(255), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("accounts_user.id", ondelete="CASCADE"), nullable=True)
    candidate_data = Column(JSON, default=dict)
    conversation_history = Column(JSON, default=list)
    covered_days = Column(JSON, default=list)
    questions_asked = Column(Integer, default=0)
    is_done = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


