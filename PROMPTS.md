# Vibe-Coding Verification & AI Usage Log (`PROMPTS.md`)

This document verifies that this project was built and iterated upon using agentic AI workflows (vibe-coding). It details the prompt sequences, design refinements, and critical bug fixes implemented by the AI.

---

## 1. Landing Page Redesign (GSAP & Three.js WebGL)

### Prompt 1: Initial Premium Design Setup
> **User:** "The landing page looks very simple, and the design is not there like 3-D animations, so make the landing page more premium and include every sections like hero, header, CTA, FAQ, features etc."

**AI Action:**
- Initialized a 3D shader pipeline (`shaders.js`) containing vertex and fragment shaders for WebGL rendering.
- Implemented `ThreeHeroCanvas.jsx` using `@react-three/fiber` and `@react-three/drei` to render a morphing, glowing WebGL sphere.
- Implemented `ScrollExperience.jsx` using GSAP ScrollTrigger for pinned horizontal scroll chapters.
- Implemented `FeatureGrid.jsx` using a customized 3D tilt card hover effect.
- Created `InteractiveRoadmap.jsx` with staggered scroll-triggered animations.

### Prompt 2: Content Strategy Expansion
> **User:** "Design the landing page to a premium product. there should be all sections like hero, header, CTA, FAQ, Features, a clear USP, problem statement, proposed solution and keep all animations"

**AI Action:**
- Added the following components to the landing page narrative flow:
  - `ProblemStatement.jsx`: A dark, cinematic section revealing technical interview pain points with staggered fade-ins.
  - `ProposedSolution.jsx`: Explaining how the AI agent functions as an empathetic, data-driven interviewer.
  - `UniqueSellingProposition.jsx`: Establishing the core differentiator ("The Only Platform That Actually Listens").
- Wired all sections into `/client/src/features/landing/pages/LandingPage.tsx`.

### Prompt 3: Styling and Palette Refresh
> **User:** "See the landing page and tell me what design you can change. I don't like the colour."

**AI Action:**
- Transitioned the entire site's theme from tech-blue to **Cyber Obsidian & Neon Teal**.
- Configured CSS variables in `index.css` for a rich Obsidian dark background (`#09090b`) and primary Neon Teal accent (`#06b6d4`).
- Updated inline styles, Tailwind color highlights, and the WebGL canvas material colors to synchronize with the new palette.

---

## 2. Hackathon Implementation Debugging

### Prompt 4: Bug Squashing
> **User:** "see this status : [Status report containing B1-B9]"

**AI Action:**
- **B1 (Route Mismatch):** Fixed client API calls in `HackathonChatPage.tsx` and `HackathonHistoryPage.tsx` to point to `/api/interview/...` instead of `/api/hackathon/...`.
- **B2 (Auth Bypassing):** Replaced `@permission_classes([IsAuthenticated])` with `AllowAny` on all session and candidate endpoints to make them public as per spec. Handled anonymous session filtering.
- **B3 & B7 (Question Counting & LLM Guards):** Added strict prompts ensuring only a single question is asked per turn. Moved the incrementing logic inside the successful try-block so error fallbacks do not consume question turns.
- **B5 (History Binding):** Updated Django view deserialization to query the nested path `session.candidate_data.get('member', {}).get('name')` to match the JSON schema.
- **B6 (Failed Missions):** Programmed the AI coordinator to dynamically flag failed cohort missions (`passed: false`).
- **B4 & B9 (Curriculum Day Coverage):** Implemented Qdrant query filters to search specifically for days that have not yet been queried in the current session.

---

## 3. Backend Test Suite Verification

### Prompt 5: Test Harness Cleanup
> **User:** "test the backend fully"

**AI Action:**
- Discovered that standalone execution scripts (`test_interview.py` and `test_resume.py`) were being incorrectly imported by Django's test runner, throwing `ValueError` and `ImportError` on DB queries during testing.
- Wrapped script bodies inside `if __name__ == '__main__':` blocks, allowing Django unit tests to run and pass cleanly.
- Successfully verified that all **50 unit tests** pass cleanly with exit code 0 (`OK`).
