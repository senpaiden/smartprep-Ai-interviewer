# 🚀 Vibe-Coding Verification & AI Usage Log (`PROMPTS.md`)

This document verifies that **SmartPrep AI** was built and iterated upon using agentic AI workflows (vibe-coding) for the **Token Tossers** hackathon entry (*The Interview Agent*). It details the prompt sequences, design refinements, architecture migrations, and critical bug fixes implemented by the AI.

---

## 1. Landing Page & Design Architecture

### Prompt 1: Initial Premium Design Setup
> **User:** "The landing page looks very simple, and the design is not there like 3-D animations, so make the landing page more premium and include every sections like hero, header, CTA, FAQ, features etc."

**AI Action:**
- Initialized a 3D shader pipeline (`shaders.js`) containing vertex and fragment shaders for WebGL rendering.
- Implemented `ThreeHeroCanvas.jsx` using `@react-three/fiber` and `@react-three/drei` to render a morphing, glowing WebGL sphere.
- Implemented `ScrollExperience.jsx` using GSAP ScrollTrigger for pinned horizontal scroll chapters.
- Implemented `FeatureGrid.jsx` using a customized 3D tilt card hover effect.
- Created `InteractiveRoadmap.jsx` with staggered scroll-triggered animations.

### Prompt 2: Content Strategy & Palette Refresh
> **User:** "Design the landing page to a premium product. there should be all sections like hero, header, CTA, FAQ, Features, a clear USP, problem statement, proposed solution and keep all animations"

**AI Action:**
- Transitioned theme to **Cyber Obsidian & Neon Teal** (`#09090b` obsidian background with `#06b6d4` neon accents).
- Configured CSS variables in `index.css` for dark-mode consistency across desktop and mobile.

---

## 2. Technical Specification & Hackathon Requirements

### Prompt 3: Technical Spec Alignment
> **User:** "The interview should assess candidate understanding, adapt naturally, ask follow-up questions, maintain context across 8 questions covering 4 curriculum days."

**AI Action:**
- Created Qdrant vector database query filters to search specifically for unqueried curriculum days.
- Enforced 8-question minimum lifecycle with structured score evaluations at completion.
- Built Hackathon API routing supporting unauthenticated candidate evaluation workflows.

---

## 3. FastAPI Migration & Async Engine

### Prompt 4: High-Performance Async Architecture
> **User:** "Migrate the backend logic to FastAPI with async database handling and modern schemas."

**AI Action:**
- Built `server_fastapi` engine powered by FastAPI, SQLAlchemy 2.0 (`asyncpg` / `aiosqlite`), Pydantic V2 schemas, and PyJWT.
- Configured Groq Llama 3.3 70B & NVIDIA Llama 3.1 8B LLM service bindings.
- Created `render.yaml` for 1-click Render web service deployment.

---

## 4. Mobile Navigation & Feature Pruning

### Prompt 5: Mobile UX Optimization & Feature Cleanup
> **User:** "remove leaderboard, company sets, fix ui issues in ai roadmap, make ui responsive for phones, add burger buttons/drawer instead of sidebar, and delete dead code."

**AI Action:**
- Refactored `AppLayout.tsx` and `Sidebar.tsx` to introduce a responsive mobile top navbar, bottom action bar, and slide-up drawer menu.
- Pruned deprecated modules (`coding`, `leaderboard`, `profile`) to streamline mobile navigation and reduce bundle size.
- Verified TypeScript compilation and Vite production build (`npm run build`).

---

## 5. Zero-Friction Auth & Account Isolation

### Prompt 6: Fast Persona Access & User Isolation Fix
> **User:** "revert changes and add a login page where user has just to add email and account details like name and username with no password creation so we have an authorized persona. Also fix account data showing across profiles."

**AI Action:**
- Created `/api/auth/quick-login/` endpoint in FastAPI that auto-provisions or retrieves database personas using Name, Username, and Email.
- Updated `LoginPage.tsx` with a single-step entry form.
- Fixed `users.py` dashboard stats to remove static mock fallback scores (`84/100`, `85%`), guaranteeing strict user data isolation.
- Implemented full client cache clearing on login (`window.location.href = '/dashboard'`).

---

## 📄 Team Information
* **Team Name**: Token Tossers
* **Project Title**: SmartPrep AI — The Interview Agent
* **Members**: Aakash Yaduwanshi, Krrish Yaduka, Ali Ahmad Raza Sheikh
* **Repository**: [https://github.com/senpaiden/smartprep-Ai-interviewer.git](https://github.com/senpaiden/smartprep-Ai-interviewer.git)
