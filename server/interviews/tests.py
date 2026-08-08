"""Tests for interviews app - interview CRUD, scoring, certificates."""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from .models import Interview, InterviewQuestion, InterviewAnswer, Certificate, Company


class InterviewAuthTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )

    def test_interview_list_unauthenticated(self):
        res = self.client.get('/api/interviews/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_interview_list_authenticated(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/interviews/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class InterviewStatsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        self.client.force_authenticate(user=self.user)

    def test_stats_empty(self):
        res = self.client.get('/api/interviews/stats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_interviews'], 0)
        self.assertEqual(res.data['completed_interviews'], 0)

    def test_stats_with_data(self):
        Interview.objects.create(
            user=self.user,
            interview_type='technical',
            difficulty='medium',
            status='completed',
            overall_score=85.0,
            technical_score=90.0,
            communication_score=80.0,
            confidence_score=85.0,
            grammar_score=85.0,
            problem_solving_score=85.0,
        )
        res = self.client.get('/api/interviews/stats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_interviews'], 1)
        self.assertEqual(res.data['completed_interviews'], 1)
        self.assertEqual(res.data['average_score'], 85.0)


class CompanyTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        self.client.force_authenticate(user=self.user)
        self.company = Company.objects.create(
            name='TestCorp',
            industry='Technology',
            description='A test company'
        )

    def test_company_list(self):
        res = self.client.get('/api/interviews/companies/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_company_detail(self):
        res = self.client.get(f'/api/interviews/companies/{self.company.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['name'], 'TestCorp')


class CertificateTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        self.client.force_authenticate(user=self.user)
        self.interview = Interview.objects.create(
            user=self.user,
            interview_type='technical',
            difficulty='medium',
            status='completed',
            overall_score=85.0,
        )
        self.certificate = Certificate.objects.create(
            user=self.user,
            interview=self.interview,
            unique_id='TESTCERT123'
        )

    def test_certificate_list(self):
        res = self.client.get('/api/interviews/certificates/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_certificate_detail(self):
        res = self.client.get(f'/api/interviews/certificates/{self.certificate.unique_id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
