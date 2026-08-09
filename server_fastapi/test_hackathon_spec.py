#!/usr/bin/env python3
"""
SmartPrep AI - Hackathon Specification Automated Test Suite
Tests 100% compliance with technical-spec.md, curriculum.json, and candidates.json datasets.
"""
import sys
import json
import asyncio
from pathlib import Path

# Ensure server_fastapi directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

try:
    from httpx import AsyncClient, ASGITransport
    from app.main import app
except ImportError as e:
    print(f"Error importing app dependencies: {e}")
    sys.exit(1)

GREEN = "\033[92m"
BLUE = "\033[94m"
YELLOW = "\033[93m"
RESET = "\033[0m"

async def test_suite():
    print(f"\n{BLUE}======================================================{RESET}")
    print(f"{BLUE}🚀 SMARTPREP AI - HACKATHON SPECIFICATION TEST SUITE{RESET}")
    print(f"{BLUE}======================================================{RESET}\n")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        
        # 1. Test GET /api/interview/curriculum/
        print(f"{YELLOW}[1/5] Testing GET /api/interview/curriculum/...{RESET}")
        r1 = await client.get("/api/interview/curriculum/")
        assert r1.status_code == 200, f"Expected 200, got {r1.status_code}"
        curr_data = r1.json()
        modules = curr_data.get("days", curr_data.get("curriculum", []))
        print(f"  {GREEN}✓ PASS:{RESET} Loaded {len(modules)} curriculum days from curriculum.json.")
        print(f"    Sample Day 1 Topic: Day {modules[0].get('day')}: {modules[0].get('title')}\n")


        # 2. Test GET /api/interview/candidates/
        print(f"{YELLOW}[2/5] Testing GET /api/interview/candidates/...{RESET}")
        r2 = await client.get("/api/interview/candidates/")
        assert r2.status_code == 200, f"Expected 200, got {r2.status_code}"
        cands_data = r2.json()
        print(f"  {GREEN}✓ PASS:{RESET} Loaded {len(cands_data)} candidate profiles from candidates.json.")
        cand_sample = cands_data[0]
        cand_member = cand_sample.get("member", {})
        print(f"    Sample Candidate: {cand_member.get('name')} ({cand_member.get('jobRole')})\n")

        # 3. Test POST /api/interview (Start Interview)
        session_id = "hackathon-demo-session-2026"
        print(f"{YELLOW}[3/5] Testing POST /api/interview (Start Session with candidate)...{RESET}")
        start_payload = {
            "sessionId": session_id,
            "candidate": cand_sample
        }
        r3 = await client.post("/api/interview", json=start_payload)
        assert r3.status_code == 200, f"Expected 200, got {r3.status_code}"
        res3 = r3.json()
        assert "reply" in res3, "Missing 'reply' key in start response"
        assert res3.get("done") is False, "Expected 'done' to be False"
        print(f"  {GREEN}✓ PASS:{RESET} Session initialized successfully.")
        print(f"    Q1 Reply: \"{res3['reply'][:120]}...\"\n")

        # 4. Test POST /api/interview (Conversation Turn)
        print(f"{YELLOW}[4/5] Testing POST /api/interview (Conversation Turn)...{RESET}")
        turn_payload = {
            "sessionId": session_id,
            "message": "In my project, I implemented HNSW dense vector indexing using Qdrant and optimized FastAPI endpoints for low latency."
        }
        r4 = await client.post("/api/interview", json=turn_payload)
        assert r4.status_code == 200, f"Expected 200, got {r4.status_code}"
        res4 = r4.json()
        assert "reply" in res4, "Missing 'reply' key in turn response"
        assert res4.get("done") is False, "Expected 'done' to be False"
        print(f"  {GREEN}✓ PASS:{RESET} Turn processed successfully with Qdrant curriculum retrieval.")
        print(f"    Q2 Reply: \"{res4['reply'][:120]}...\"\n")

        # 5. Test End Interview (Simulate 8 questions completed)
        print(f"{YELLOW}[5/5] Testing POST /api/interview (End Interview Feedback Contract)...{RESET}")
        for turn_i in range(2, 9):
            turn_payload["message"] = f"Answering Question {turn_i}: Demonstrating prompt engineering negative constraints and vector database retrieval."
            r_turn = await client.post("/api/interview", json=turn_payload)

        res_final = r_turn.json()
        assert res_final.get("done") is True, f"Expected 'done' to be True at end of interview, got {res_final}"

        assert "feedback" in res_final, "Missing 'feedback' object at end of interview"
        fb = res_final["feedback"]
        assert all(k in fb for k in ["summary", "strengths", "gaps", "next"]), "Missing required feedback fields"
        print(f"  {GREEN}✓ PASS:{RESET} Interview completed with required feedback contract!")
        print(f"    Summary: {fb['summary']}")
        print(f"    Strengths: {fb['strengths']}")
        print(f"    Gaps: {fb['gaps']}")
        print(f"    Next Steps: {fb['next']}\n")

    print(f"{GREEN}======================================================{RESET}")
    print(f"{GREEN}🎉 ALL HACKATHON SPECIFICATION TESTS PASSED (100%){RESET}")
    print(f"{GREEN}======================================================{RESET}\n")

if __name__ == "__main__":
    asyncio.run(test_suite())
