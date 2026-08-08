"""Tests for hackathon app - interview endpoint, sessions, candidates."""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from .models import HackathonSession


class HackathonNoAuthTest(TestCase):
    """Spec says no auth required — verify all endpoints are accessible without auth."""

    def setUp(self):
        self.client = APIClient()

    def test_sessions_endpoint_no_auth(self):
        res = self.client.get('/api/interview/sessions/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_candidates_endpoint_no_auth(self):
        res = self.client.get('/api/interview/candidates/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_interview_validation_no_auth(self):
        """Test that validation works without auth (no 401/403)."""
        res = self.client.post('/api/interview/', {}, format='json')
        # Should get 400 (bad request), not 401/403
        self.assertIn(res.status_code, [status.HTTP_400_BAD_REQUEST])


class HackathonSessionTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_sessions_list_empty(self):
        res = self.client.get('/api/interview/sessions/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()['sessions'], [])

    def test_sessions_list_returns_all(self):
        HackathonSession.objects.create(
            session_id='session-1',
            candidate_data={'member': {'name': 'Alice', 'jobRole': 'Engineer'}},
        )
        HackathonSession.objects.create(
            session_id='session-2',
            candidate_data={'member': {'name': 'Bob', 'jobRole': 'Designer'}},
        )
        res = self.client.get('/api/interview/sessions/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()['sessions']), 2)

    def test_session_detail(self):
        session = HackathonSession.objects.create(
            session_id='test-session',
            candidate_data={'member': {'name': 'Test', 'jobRole': 'Dev'}},
        )
        res = self.client.get(f'/api/interview/sessions/{session.session_id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()['session_id'], 'test-session')

    def test_session_not_found(self):
        res = self.client.get('/api/interview/sessions/nonexistent/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_interview_endpoint_no_session_id(self):
        res = self.client.post('/api/interview/', {
            'message': 'hello'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_interview_endpoint_invalid_payload(self):
        res = self.client.post('/api/interview/', {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_candidate_name_extracted_from_member(self):
        HackathonSession.objects.create(
            session_id='name-test',
            candidate_data={'member': {'name': 'Sarah', 'jobRole': 'Data Engineer'}},
        )
        res = self.client.get('/api/interview/sessions/')
        session = res.json()['sessions'][0]
        self.assertEqual(session['candidate_name'], 'Sarah')
        self.assertEqual(session['candidate_role'], 'Data Engineer')
