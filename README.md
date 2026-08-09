# 🚀 SmartPrep AI — Next-Gen AI Technical Interviewer & Resume Analyzer

SmartPrep AI is an enterprise-grade, AI-powered technical interview and resume analytics platform. It simulates real-world technical interviews with adaptive LLM questioning, real-time speech interaction (Groq Whisper), automated ATS resume evaluation, personalized learning roadmaps, and 5-dimensional skill analytics.

---

## 📌 Problem Statement & Solution

### The Challenge
Technical interviews are often stressful, inconsistent, and inaccessible. Candidates lack realistic, real-time feedback loops to practice technical depth, speech confidence, and communication. Generic question banks fail to adapt to a candidate's specific background or track multi-session performance growth over time.

### The SmartPrep Solution
SmartPrep AI bridges this gap by delivering **role-specific and curriculum-aligned mock interviews** that adapt dynamically to candidate responses. Powered by **LLaMA 3.3 70B and LLaMA 3.1 8B models**, the platform evaluates responses across 5 core dimensions (*Technical Accuracy*, *Communication*, *Confidence*, *Problem Solving*, and *Grammar*), generating instant diagnostic reports and actionable feedback.

---

## 🌟 Key Features & Capability Matrix

### 1. ⚡ Zero-Friction Persona Access
* Instant onboarding by providing **Full Name**, **Username**, and **Email**.
* Bypasses password requirements to streamline demo and candidate evaluation workflows while maintaining full backend database user isolation and JWT authentication tokens.

### 2. 🗣️ Real-Time Voice & Text Mock Interviews
* **Speech-to-Text Integration**: Powered by Groq Whisper for low-latency, accurate voice transcription during live interview practice.
* **Adaptive AI Questioning**: Real-time evaluation of user answers with dynamic follow-up questions tailored to role requirements and answer quality.
* **12 Pre-Configured Roles**: Full-Stack, AI/ML Engineer, Frontend, Backend, DevOps, Data Scientist, System Architect, and more.

### 3. 📄 AI Resume ATS Analyzer & Parser
* Upload PDF resumes for instant text extraction using `pypdf`.
* Generates an **ATS Match Score (0–100%)**, key skill extraction badges, candidate evaluation summaries, and customized interview focus areas.

### 4. 📊 5-Dimension Performance Radar & Analytics
* Evaluates technical accuracy, communication style, speech confidence, problem-solving structure, and grammatical precision.
* Displays dynamic progress charts, interview history logs, and automated performance badges.

### 5. 🗺️ Personalized Learning Roadmap
* Curriculum-aligned preparation cards broken down into day-by-day learning milestones for technical growth and interview readiness.

### 6. 📱 Mobile-Native Responsive UI
* Designed with a mobile-first philosophy featuring top navbar navigation, bottom action tabs, and slide-up drawer menus for seamless mobile phone usage.

---

## 🏗️ Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT (Vite + React)                             |
|  - Modern Dark Mode UI / TailwindCSS               - Zustand State Store          |
|  - Speech Recognition (Groq Whisper)               - TanStack React Query         |
+-----------------------------------------------------------------------------------+
                                          |
                                    REST API / JSON
                                          v
+-----------------------------------------------------------------------------------+
|                             BACKEND (FastAPI Async Engine)                        |
|  - JWT Authentication (/api/auth/quick-login/)     - Async SQLAlchemy 2.0 ORM     |
|  - AI Interviewer & Evaluation Service             - PyPDF Resume Extractor       |
+-----------------------------------------------------------------------------------+
                       |                                       |
                       v                                       v
         +--------------------------+             +--------------------------+
         |     Database Layer       |             |       AI Providers       |
         | - PostgreSQL / SQLite    |             | - Groq (Llama 3.3 70B)   |
         | - Asyncpg connection pool|             | - NVIDIA (Llama 3.1 8B)  |
         +--------------------------+             +--------------------------+
```

---

## 🛠️ Complete Tech Stack

### Backend (`server_fastapi`)
| Technology | Purpose |
| :--- | :--- |
| **FastAPI** | High-performance Python 3.12 Async Web Engine |
| **SQLAlchemy 2.0 + asyncpg** | Async ORM & PostgreSQL Database Driver |
| **aiosqlite** | Async SQLite Driver for local development |
| **Pydantic V2** | Type validation, schemas, and setting management |
| **Groq Llama 3.3 70B** | Advanced question generation & candidate answer evaluation |
| **NVIDIA Llama 3.1 8B** | Fast inference for real-time scoring and summary generation |
| **PyPDF** | Asynchronous PDF resume parsing and text extraction |
| **PyJWT + Passlib** | JWT authentication engine and password hashing |

### Frontend (`client`)
| Technology | Purpose |
| :--- | :--- |
| **React 18 + Vite** | Fast SPA framework and module bundler |
| **TypeScript** | Strict type-safety across components and stores |
| **TailwindCSS** | Custom dark-mode responsive design system |
| **Zustand** | Auth and application UI state management |
| **TanStack React Query** | Server state caching, refetching, and background synchronization |
| **Lucide React** | Modern iconography |
| **Framer Motion** | Micro-animations and page transitions |

---

## 📦 Prerequisites & Local Installation

### Prerequisites
* **Node.js**: v18.0 or higher
* **Python**: v3.10 or higher
* **Git**

### 1. Backend Setup (`server_fastapi`)

```bash
# Navigate to the backend directory
cd server_fastapi

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install -r requirements.txt

# Create .env file with configuration (see Environment Variables section)
cp .env.example .env

# Run the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*FastAPI Interactive OpenAPI Docs will be available at `http://localhost:8000/docs`*

### 2. Frontend Setup (`client`)

```bash
# Navigate to the client directory
cd client

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend application will run at `http://localhost:5173`*

---

## 🔑 Environment Variables Configuration

Create a `.env` file in `server_fastapi/.env`:

```env
# Server Settings
PROJECT_NAME="SmartPrep API"
DEBUG=True
SECRET_KEY="your-production-secret-key"

# Database Configuration (PostgreSQL or SQLite)
DATABASE_URL="postgresql://user:password@localhost:5432/smartprep"

# Authentication
JWT_SECRET_KEY="your-jwt-secret-key"
JWT_ALGORITHM="HS256"
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# AI API Keys
GROQ_API_KEY="gsk_your_groq_api_key"
NVIDIA_API_KEY="nvapi-your_nvidia_api_key"

# CORS Configuration
FRONTEND_URL="http://localhost:5173"
```

---

## 📑 API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/quick-login/` | Fast Persona Login (Name, Username, Email) -> JWT Tokens |
| `POST` | `/api/auth/login/` | Standard email/password authentication |
| `POST` | `/api/auth/register/` | Register new account |
| `POST` | `/api/auth/refresh/` | Refresh JWT access token |

### User Analytics & Dashboard
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users/dashboard/` | Retrieve user stats, ATS resume rating, & progress chart data |

### Mock Interviews
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/interviews/me/` | List candidate's interview history |
| `POST` | `/api/interviews/start/` | Start role-based or curriculum mock interview |
| `POST` | `/api/interviews/submit-answer/` | Submit answer and return real-time AI evaluation |
| `POST` | `/api/interviews/{id}/complete/` | Complete interview session and generate overall report |

### Resume Analyzer
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/resumes/upload/` | Upload PDF resume for parsing and ATS evaluation |
| `GET` | `/api/resumes/` | Get candidate's uploaded resumes |
| `GET` | `/api/resumes/{id}/analysis/` | Retrieve detailed ATS rating and match reasons |

### Hackathon Mode
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/hackathon/sessions/` | List public hackathon interview sessions |
| `POST` | `/api/hackathon/start/` | Launch instant AI hackathon chat interview |

---

## 📂 Project Directory Structure

```
SmartPrep/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Layout (Navbar, Sidebar, AppLayout) & UI components
│   │   ├── features/           # Modular feature pages
│   │   │   ├── auth/           # Quick Login & Auth pages
│   │   │   ├── dashboard/      # Main Dashboard & Performance Charts
│   │   │   ├── interview/      # Text & Voice Mock Interview Engine
│   │   │   ├── resume/         # ATS Resume Analyzer & Upload
│   │   │   ├── roadmap/        # Interactive Preparation Roadmap
│   │   │   ├── certificates/   # Candidate Certificates & Badges
│   │   │   └── hackathon/      # Hackathon Chat Interface
│   │   ├── stores/             # Zustand stores (Auth & Global state)
│   │   ├── lib/                # Axios API client & utility functions
│   │   └── App.tsx             # Route guards & Router setup
│   └── vercel.json             # Vercel SPA routing & backend proxy configuration
│
├── server_fastapi/             # FastAPI Async Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py         # DB session & auth dependencies
│   │   │   └── v1/             # Endpoints (auth, users, interviews, resumes, hackathon)
│   │   ├── core/               # App config, database setup, JWT security
│   │   ├── db/models/          # SQLAlchemy async models (User, Profile, Interview, Resume)
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # AI Service (Groq Llama 3.3 70B & NVIDIA integration)
│   │   └── main.py             # FastAPI app entry point
│   ├── requirements.txt        # Production backend dependencies
│   └── render.yaml             # Render deployment configuration
│
├── README.md                   # Complete Project Documentation
└── LICENSE                     # MIT License
```

---

## 🌐 Production Deployment Guide

### 1. Render Deployment (Backend FastAPI)
1. Link your GitHub repository in the **Render Dashboard**.
2. Select **New Web Service** with the following parameters:
   * **Root Directory**: `server_fastapi`
   * **Environment**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Configure Environment Variables (`DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY`, `GROQ_API_KEY`, `NVIDIA_API_KEY`).

### 2. Vercel Deployment (Frontend React SPA)
1. Import repository into **Vercel Dashboard**.
2. Set configuration parameters:
   * **Root Directory**: `client`
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. Set Environment Variable `VITE_API_URL` pointing to your Render backend URL.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes (`git commit -m 'Add awesome feature'`).
4. Push to the branch (`git push origin feature/awesome-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
