"""Tests for coding app - challenges, submissions."""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from .models import CodingChallenge, CodingSubmission


class CodingChallengeTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        self.client.force_authenticate(user=self.user)
        self.challenge = CodingChallenge.objects.create(
            title='Two Sum',
            description='Find two numbers that add up to target',
            difficulty='easy',
            category='Arrays',
            starter_code='def two_sum(nums, target): pass',
            public_test_cases=[{'input': '[2,7,11,15], 9', 'output': '[0,1]'}],
        )

    def test_challenge_list(self):
        res = self.client.get('/api/coding/challenges/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_challenge_detail(self):
        res = self.client.get(f'/api/coding/challenges/{self.challenge.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], 'Two Sum')

    def test_challenge_unauthenticated(self):
        self.client.force_authenticate(user=None)
        res = self.client.get('/api/coding/challenges/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class CodingSubmissionTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        self.client.force_authenticate(user=self.user)
        self.challenge = CodingChallenge.objects.create(
            title='Two Sum',
            description='Find two numbers',
            difficulty='easy',
            category='Arrays',
            starter_code='def two_sum(nums, target): pass',
            public_test_cases=[],
        )

    def test_submission_list(self):
        res = self.client.get('/api/coding/submissions/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_submission_model(self):
        submission = CodingSubmission.objects.create(
            challenge=self.challenge,
            user=self.user,
            code='def two_sum(nums, target): return [0, 1]',
            language='python',
            status='accepted',
            total_tests=5,
            passed_tests=5,
        )
        self.assertEqual(submission.status, 'accepted')
        self.assertEqual(submission.total_tests, 5)
