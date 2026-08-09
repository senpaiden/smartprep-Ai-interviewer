# 🚀 SmartPrep AI — AI Technical Interviewer & Resume Analyzer

SmartPrep is an AI-powered technical interview platform designed to simulate real-world technical interviews with adaptive AI questioning, speech interaction, resume ATS analysis, and real-time performance analytics.

---

## 🌟 Key Features

* **⚡ Zero-Friction Persona Access**: Instant access by providing your Name, Username, and Email. No complex passwords or account registration steps required.
* **🗣️ Voice & Text Mock Interviews**: Speak or type your answers naturally using Speech-to-Text (Groq Whisper) and Text-to-Speech integration.
* **📄 AI Resume ATS Analyzer**: Upload resumes (PDF) for immediate ATS scoring, skill extraction, and candidate match reasons.
* **📊 Skill Radar & Dashboard**: Track performance across Technical Accuracy, Communication, Confidence, Problem Solving, and Grammar.
* **🗺️ Interactive Learning Roadmap**: Personalized preparation cards broken down into day-by-day learning milestones.
* **📱 Mobile-First Responsive Design**: Optimized UI featuring a top navigation bar, bottom action tabs, and slide-up drawer for mobile devices.

---

## 🛠️ Tech Stack

### Backend (`server_fastapi`)
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python Async Web Framework |
| **SQLAlchemy 2.0 + asyncpg** | Async ORM & PostgreSQL Database driver |
| **Pydantic V2** | Request validation & setting management |
| **Groq Llama 3.3 70B & 8B** | Real-time question generation & candidate evaluation |
| **PyPDF** | Async PDF resume parsing |
| **PyJWT + Passlib** | JWT authentication engine |

### Frontend (`client`)
| Technology | Purpose |
|------------|---------|
| **React 18 + Vite** | Fast SPA UI framework & bundler |
| **TypeScript** | Type-safe state management |
| **TailwindCSS** | Custom dark-mode responsive design system |
| **Zustand** | Auth & UI state management |
| **React Query (TanStack)** | Async server state caching & automatic refetching |
| **Lucide React** | Modern iconography |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18+
* **Python**: v3.10+
* **Git**

### 1. Clone & Set Up Backend
```bash
cd server_fastapi

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*FastAPI interactive docs available at: `http://localhost:8000/docs`*

### 2. Set Up Frontend
```bash
cd client

# Install packages
npm install

# Start Vite dev server
npm run dev
```
*App will open at: `http://localhost:5173`*

---

## 🌐 Production Deployment

### Backend (Render)
* **Root Directory**: `server_fastapi`
* **Build Command**: `pip install -r requirements.txt`
* **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
* **Root Directory**: `client`
* **Framework Preset**: Vite
* **Build Command**: `npm run build`
* **Output Directory**: `dist`

---

## 📄 License
Licensed under the [MIT License](LICENSE).
