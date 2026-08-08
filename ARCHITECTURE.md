# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React + Vite)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │   Auth   │ │Dashboard │ │Interview │ │  Coding  │ │  Resume  │         │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │ │  Module  │         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘         │
│       │             │            │            │            │                │
│       └─────────────┴────────────┴────────────┴────────────┘                │
│                                    │                                       │
│                              ┌─────┴─────┐                                 │
│                              │  Zustand   │                                 │
│                              │   Store    │                                 │
│                              └─────┬─────┘                                 │
│                                    │                                       │
│                              ┌─────┴─────┐                                 │
│                              │  API Layer │                                 │
│                              │  (Axios)   │                                 │
│                              └─────┬─────┘                                 │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ HTTP/JSON
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SERVER (Django + DRF)                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Accounts │ │Interviews│ │ Resumes  │ │   AI     │ │  Coding  │         │
│  │   App    │ │   App    │ │   App    │ │ Service  │ │   App    │         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘         │
│       │             │            │            │            │                │
│       └─────────────┴────────────┴────────────┴────────────┘                │
│                                    │                                       │
│                              ┌─────┴─────┐                                 │
│                              │  Database  │                                 │
│                              │  (Postgres)│                                 │
│                              └───────────┘                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  NVIDIA  │ │   Groq   │ │  Qdrant  │ │  Judge0  │ │  Neon    │         │
│  │  LLaMA   │ │ Whisper  │ │  Vector  │ │  Code    │ │ Postgres │         │
│  │   API    │ │   STT    │ │   DB     │ │  Runner  │ │   DB     │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERVIEW FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User selects role/topic                                         │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Start     │───▶│  Generate   │───▶│   Present   │         │
│  │ Interview   │    │  Question   │    │  Question   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                              │                  │
│                                              ▼                  │
│                                       ┌─────────────┐          │
│                                       │   User      │          │
│                                       │   Answers   │          │
│                                       │  (Text/Voice)│         │
│                                       └─────────────┘          │
│                                              │                  │
│                         ┌────────────────────┼────────────┐    │
│                         ▼                    ▼            │    │
│                  ┌─────────────┐    ┌─────────────┐       │    │
│                  │  Evaluate   │    │   Speech    │       │    │
│                  │  Answer     │    │   to Text   │       │    │
│                  │  (10 dims)  │    │   (Groq)    │       │    │
│                  └─────────────┘    └─────────────┘       │    │
│                         │                                 │    │
│                         ▼                                 │    │
│                  ┌─────────────┐                          │    │
│                  │  Store      │◀─────────────────────────┘    │
│                  │  Results    │                               │
│                  └─────────────┘                               │
│                         │                                      │
│                         ▼                                      │
│                  ┌─────────────┐                               │
│                  │  Continue   │──── (more questions)          │
│                  │  or End     │                               │
│                  └─────────────┘                               │
│                         │                                      │
│                         ▼                                      │
│                  ┌─────────────┐                               │
│                  │  Generate   │                               │
│                  │  Report     │                               │
│                  └─────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER MODEL                              │
├─────────────────────────────────────────────────────────────────┤
│  id (UUID)          email           username                    │
│  password           role            is_email_verified           │
│  avatar             created_at      updated_at                  │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       INTERVIEW MODEL                           │
├─────────────────────────────────────────────────────────────────┤
│  id (UUID)          user_id         interview_type              │
│  difficulty         status          duration_minutes            │
│  tech_stack (JSON)  role            candidate_id                │
│  overall_score      technical_score communication_score         │
│  ai_context (JSON)  ai_summary (JSON)                          │
│  started_at         completed_at    created_at                  │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  INTERVIEW QUESTION MODEL                       │
├─────────────────────────────────────────────────────────────────┤
│  id (UUID)          interview_id    question_text               │
│  category           order           is_follow_up                │
│  expected_answer_points (JSON)                                 │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  INTERVIEW ANSWER MODEL                         │
├─────────────────────────────────────────────────────────────────┤
│  id (UUID)          question_id     answer_text                 │
│  technical_accuracy confidence      communication               │
│  english_fluency    grammar         vocabulary                  │
│  fluency            relevance       completeness                │
│  problem_solving    feedback        strengths (JSON)            │
│  improvements (JSON)                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      RESUME MODEL                               │
├─────────────────────────────────────────────────────────────────┤
│  id (UUID)          user_id         file                        │
│  original_filename  ats_score       resume_rating               │
│  technical_skills (JSON)  projects (JSON)                       │
│  certifications (JSON)    experience (JSON)                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      COMPANY MODEL                              │
├─────────────────────────────────────────────────────────────────┤
│  id (UUID)          name            industry                    │
│  required_skills (JSON)  interview_guidelines                   │
│  resume_filter_keywords                                       │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────┐
│               KNOWLEDGE BASE DOCUMENT MODEL                    │
├─────────────────────────────────────────────────────────────────┤
│  id (UUID)          company_id      filename                    │
│  file_path          created_at                                │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT CHUNK MODEL                         │
├─────────────────────────────────────────────────────────────────┤
│  id (UUID)          document_id     text                        │
│  embedding (JSON)   chunk_index                               │
└─────────────────────────────────────────────────────────────────┘
```

## AI Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI SERVICE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Resume    │    │  Question   │    │   Answer    │         │
│  │  Analysis   │    │ Generation  │    │ Evaluation  │         │
│  │  (8B Fast)  │    │  (70B)      │    │  (8B Fast)  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                   │                │
│         │                  │                   │                │
│         ▼                  ▼                   ▼                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  ATS Score  │    │  Adaptive   │    │  10-Dimension│        │
│  │  Skills     │    │  Follow-ups │    │  Scoring    │         │
│  │  Projects   │    │  Context    │    │  Feedback   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Code       │    │  Summary    │    │  Speech     │         │
│  │  Review     │    │  Report     │    │  to Text    │         │
│  │  (8B Fast)  │    │  (8B Fast)  │    │  (Groq)     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
interview-agent/
│
├── client/                          # React Frontend
│   ├── public/                      # Static assets
│   │   ├── pwa-192x192.svg         # PWA icon
│   │   └── pwa-512x512.svg         # PWA icon
│   │
│   ├── src/
│   │   ├── App.tsx                  # Root router
│   │   ├── main.tsx                 # Entry point
│   │   ├── index.css                # Global styles, CSS variables
│   │   │
│   │   ├── features/                # Feature modules
│   │   │   ├── auth/                # Login, Register, Forgot Password
│   │   │   │   └── pages/
│   │   │   │       ├── LoginPage.tsx
│   │   │   │       ├── RegisterPage.tsx
│   │   │   │       └── ForgotPasswordPage.tsx
│   │   │   │
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   │   └── pages/
│   │   │   │       └── DashboardPage.tsx
│   │   │   │
│   │   │   ├── interview/           # Interview flow
│   │   │   │   └── pages/
│   │   │   │       ├── InterviewSetupPage.tsx   # Role/candidate selection
│   │   │   │       ├── InterviewPage.tsx        # Text interview
│   │   │   │       ├── VoiceInterviewPage.tsx   # Voice interview
│   │   │   │       ├── InterviewResultPage.tsx  # Results + AI report
│   │   │   │       └── InterviewHistoryPage.tsx # Past interviews
│   │   │   │
│   │   │   ├── coding/              # Code challenges
│   │   │   │   └── pages/
│   │   │   │       ├── CodingChallengePage.tsx
│   │   │   │       └── CodingEditorPage.tsx
│   │   │   │
│   │   │   ├── resume/              # Resume upload & analysis
│   │   │   │   └── pages/
│   │   │   │       └── ResumeAnalyzerPage.tsx
│   │   │   │
│   │   │   ├── certificates/        # View certificates
│   │   │   │   └── pages/
│   │   │   │       └── CertificatesPage.tsx
│   │   │   │
│   │   │   ├── leaderboard/         # Rankings
│   │   │   │   └── pages/
│   │   │   │       └── LeaderboardPage.tsx
│   │   │   │
│   │   │   ├── roadmap/             # Learning path
│   │   │   │   └── pages/
│   │   │   │       └── RoadmapPage.tsx
│   │   │   │
│   │   │   ├── hackathon/           # Hackathon interview mode
│   │   │   │   └── pages/
│   │   │   │       ├── HackathonChatPage.tsx
│   │   │   │       └── HackathonHistoryPage.tsx
│   │   │   │
│   │   │   ├── companies/           # Company-specific interviews
│   │   │   │   └── pages/
│   │   │   │       └── CompanyInterviewsPage.tsx
│   │   │   │
│   │   │   ├── landing/             # Public landing page
│   │   │   │   └── pages/
│   │   │   │       └── LandingPage.tsx
│   │   │   │
│   │   │   └── profile/             # User profile
│   │   │       └── pages/
│   │   │           └── ProfilePage.tsx
│   │   │
│   │   ├── stores/                  # Zustand state
│   │   │   ├── authStore.ts         # Auth state + JWT
│   │   │   └── interviewStore.ts    # Interview state
│   │   │
│   │   ├── components/              # Shared components
│   │   │   └── layout/
│   │   │       └── AppLayout.tsx    # Sidebar + nav
│   │   │
│   │   ├── lib/                     # Utilities
│   │   │   └── api.ts              # Axios instance + interceptors
│   │   │
│   │   ├── hooks/                   # Custom hooks
│   │   └── types/                   # TypeScript types
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                          # Django Backend
│   ├── manage.py                    # Django CLI
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment template
│   │
│   ├── core/                        # Project settings
│   │   ├── settings.py              # Django config
│   │   ├── urls.py                  # Root URL routing
│   │   ├── pagination.py            # Standard pagination
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── accounts/                    # Authentication
│   │   ├── models.py               # User model
│   │   ├── views.py                # Login, register, verify
│   │   ├── serializers.py          # User serializers
│   │   ├── urls.py                 # Auth URLs
│   │   └── user_urls.py            # User profile URLs
│   │
│   ├── interviews/                  # Interview logic
│   │   ├── models.py               # Interview, Question, Answer, Company
│   │   ├── views.py                # Start, submit, complete
│   │   ├── serializers.py          # Interview serializers
│   │   ├── urls.py                 # Interview URLs
│   │   └── context_helpers.py      # Shared curriculum/resume context
│   │
│   ├── ai_service/                  # AI integration
│   │   ├── services.py             # NVIDIA, Groq, evaluation
│   │   └── views.py                # Transcription endpoint
│   │
│   ├── resumes/                     # Resume handling
│   │   ├── models.py               # Resume model
│   │   ├── views.py                # Upload, analysis
│   │   └── serializers.py
│   │
│   ├── coding/                      # Code challenges
│   │   ├── models.py               # Challenge, Submission
│   │   ├── views.py                # Submit, evaluate
│   │   ├── judge0_service.py       # Judge0 integration
│   │   └── serializers.py
│   │
│   ├── notifications/               # User notifications
│   │   ├── models.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── hackathon/                   # Hackathon mode
│   │   ├── models.py               # Hackathon session
│   │   ├── views.py                # Start, submit
│   │   ├── services.py             # Curriculum-based questions
│   │   └── urls.py
│   │
│   ├── hackathon_data/              # Static data
│   │   ├── candidates.json         # 20 AI cohort candidates
│   │   └── curriculum.json         # 31-day curriculum
│   │
│   └── qdrant_data/                 # Local Qdrant storage
│       └── meta.json
│
├── company_scrapers/                # Job description scrapers
│   ├── scrape_google.py
│   ├── scrape_microsoft.py
│   ├── scrape_amazon.py
│   └── ...
│
├── guidelines/                      # Project guidelines
│
├── .gitignore
├── README.md
├── ARCHITECTURE.md
├── LICENSE
└── vite.config.ts                   # Root Vite config
```

## Key Design Decisions

### 1. Monorepo Structure
Single repository for frontend and backend simplifies deployment and ensures API compatibility.

### 2. Feature-Based Frontend
Each feature (auth, interview, coding) is a self-contained module with its own pages, reducing merge conflicts and improving code organization.

### 3. Context Helpers Pattern
`interviews/context_helpers.py` extracts shared logic (curriculum context, resume context, company guidelines) used by both `start_interview` and `submit_answer` views, eliminating code duplication.

### 4. Dual AI Models
- **LLaMA 70B** for question generation (needs nuance)
- **LLaMA 8B** for evaluation/analysis (needs speed)
- **Groq Whisper** for speech-to-text (real-time)

### 5. Qdrant for RAG
Vector database stores curriculum embeddings for semantic search, ensuring questions cover the right topics based on candidate progress.

### 6. 10-Dimension Evaluation
Each answer is scored across 10 independent dimensions rather than a single score, providing actionable feedback.

### 7. Async Code Review
AI code review runs in a daemon thread after submission, keeping the API response fast while still providing feedback.

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CDN (Vercel/Netlify)                  │    │
│  │                    Static Assets                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Frontend (React SPA)                        │    │
│  │              Built, Minified, Cached                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Backend (Django + Gunicorn)                  │    │
│  │              Render / Railway / Fly.io                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│              │                   │                   │           │
│              ▼                   ▼                   ▼           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Neon Postgres  │ │   Qdrant Cloud  │ │   NVIDIA API    │   │
│  │   (Serverless)   │ │   (Managed)     │ │   (LLaMA)       │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
