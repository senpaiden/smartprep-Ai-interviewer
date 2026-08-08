"""Shared helpers for building interview context."""

import json
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def load_candidates():
    """Load candidates from candidates.json."""
    try:
        path = os.path.join(settings.BASE_DIR, 'hackathon_data', 'candidates.json')
        with open(path, 'r') as f:
            return json.load(f).get('candidates', [])
    except Exception:
        return []


def find_candidate(candidate_id):
    """Find a candidate by their member.id."""
    candidates = load_candidates()
    return next(
        (c for c in candidates if c.get('member', {}).get('id') == candidate_id),
        None
    )


def build_curriculum_context(candidate, interview, search_query=None):
    """Build curriculum context from a candidate profile and Qdrant RAG."""
    member = candidate.get('member', {})
    missions = candidate.get('missions', [])

    weak_topics = [
        m['title'] for m in missions
        if m.get('skipped') or m.get('attempts', 0) > 2 or m.get('passed') is False
    ]

    all_days = set(range(1, 32))
    covered = set(interview.covered_days)
    uncovered = sorted(all_days - covered)

    retrieved_curriculum = ""
    try:
        from hackathon.services import get_qdrant_client
        qdrant = get_qdrant_client()
        from qdrant_client.http import models as qd_models

        must_not_filters = []
        for day in interview.covered_days:
            must_not_filters.append(qd_models.FieldCondition(
                key="day",
                match=qd_models.MatchValue(value=day)
            ))
        query_filter = None
        if must_not_filters and len(interview.covered_days) < 4:
            query_filter = qd_models.Filter(must_not=must_not_filters)

        if not search_query:
            search_query = f"AI Cohort curriculum for {member.get('jobRole', 'AI Engineer')}"

        results = qdrant.query(
            collection_name="ai_cohort_curriculum",
            query_text=search_query,
            query_filter=query_filter,
            limit=2,
        )
        for res in results:
            retrieved_curriculum += res.document + "\n\n"
            day = res.metadata.get('day')
            if day and day not in interview.covered_days:
                interview.covered_days.append(day)
    except Exception as e:
        logger.error(f"Qdrant retrieval error: {e}")

    return {
        "candidate_name": member.get('name', 'Candidate'),
        "candidate_role": member.get('jobRole', ''),
        "weak_topics": weak_topics,
        "covered_days": interview.covered_days,
        "uncovered_days": uncovered,
        "retrieved_curriculum": retrieved_curriculum,
    }


def build_resume_context(user, interview):
    """Build resume context from the user's latest analyzed resume."""
    from resumes.models import Resume
    latest_resume = Resume.objects.filter(
        user=user, status='analyzed'
    ).order_by('-created_at').first()
    if latest_resume:
        return {
            "role": interview.role or interview.interview_type,
            "tech_stack": latest_resume.technical_skills,
            "projects": latest_resume.projects,
            "certifications": latest_resume.certifications,
            "experience": latest_resume.experience,
        }
    return None


def fetch_company_guidelines(company_name):
    """Fetch company interview guidelines if available."""
    if not company_name:
        return None
    from interviews.models import Company
    company_obj = Company.objects.filter(name__iexact=company_name).first()
    if company_obj and company_obj.interview_guidelines:
        return company_obj.interview_guidelines
    return None
