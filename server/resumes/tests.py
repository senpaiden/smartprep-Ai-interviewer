"""Tests for resumes app - upload, analyze, list."""

import io
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from .models import Resume


class ResumeUploadTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        self.client.force_authenticate(user=self.user)

    def test_resume_list_empty(self):
        res = self.client.get('/api/resumes/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_resume_upload_not_pdf(self):
        file = io.BytesIO(b'not a pdf')
        file.name = 'test.txt'
        res = self.client.post('/api/resumes/upload/', {'file': file}, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resume_upload_unauthenticated(self):
        self.client.force_authenticate(user=None)
        file = io.BytesIO(b'%PDF-1.4 fake pdf content')
        file.name = 'test.pdf'
        res = self.client.post('/api/resumes/upload/', {'file': file}, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_resume_model_fields(self):
        resume = Resume.objects.create(
            user=self.user,
            file='resumes/test.pdf',
            original_filename='test.pdf',
            status='uploaded',
        )
        self.assertEqual(str(resume), 'test.pdf - test@example.com')
        self.assertEqual(resume.status, 'uploaded')
        self.assertEqual(resume.ats_score, 0)
        self.assertEqual(resume.resume_rating, 0.0)


class ResumeAnalysisTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        self.client.force_authenticate(user=self.user)
        self.resume = Resume.objects.create(
            user=self.user,
            file='resumes/test.pdf',
            original_filename='test.pdf',
            status='uploaded',
        )

    def test_analyze_nonexistent_resume(self):
        from uuid import uuid4
        res = self.client.post(f'/api/resumes/{uuid4()}/analyze/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_analyze_already_analyzing(self):
        self.resume.status = 'analyzing'
        self.resume.save()
        res = self.client.post(f'/api/resumes/{self.resume.id}/analyze/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resume_detail(self):
        res = self.client.get(f'/api/resumes/{self.resume.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['original_filename'], 'test.pdf')

    def test_resume_delete(self):
        res = self.client.delete(f'/api/resumes/{self.resume.id}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Resume.objects.filter(id=self.resume.id).exists())
