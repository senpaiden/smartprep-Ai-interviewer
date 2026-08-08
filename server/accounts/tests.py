"""Tests for accounts app - authentication, user management."""

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Profile


class RegisterTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.valid_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
        }

    def test_register_success(self):
        res = self.client.post('/api/auth/register/', self.valid_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])
        self.assertIn('refresh', res.data['tokens'])
        self.assertEqual(res.data['user']['email'], 'test@example.com')
        self.assertTrue(User.objects.filter(email='test@example.com').exists())

    def test_register_creates_profile(self):
        self.client.post('/api/auth/register/', self.valid_data, format='json')
        user = User.objects.get(email='test@example.com')
        self.assertTrue(hasattr(user, 'profile'))

    def test_register_password_mismatch(self):
        data = self.valid_data.copy()
        data['password_confirm'] = 'WrongPass123!'
        res = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        self.client.post('/api/auth/register/', self.valid_data, format='json')
        res = self.client.post('/api/auth/register/', self.valid_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        data = self.valid_data.copy()
        data['password'] = '123'
        data['password_confirm'] = '123'
        res = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )

    def test_login_success(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'password': 'StrongPass123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', res.data)
        self.assertEqual(res.data['user']['email'], 'test@example.com')

    def test_login_wrong_password(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'password': 'WrongPass'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_email(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'nobody@example.com',
            'password': 'StrongPass123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class TokenRefreshTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        res = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'password': 'StrongPass123!'
        }, format='json')
        self.refresh_token = res.data['tokens']['refresh']

    def test_token_refresh_success(self):
        res = self.client.post('/api/auth/refresh/', {
            'refresh': self.refresh_token
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_token_refresh_invalid(self):
        res = self.client.post('/api/auth/refresh/', {
            'refresh': 'invalid-token'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PasswordResetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )

    def test_forgot_password_success(self):
        res = self.client.post('/api/auth/forgot-password/', {
            'email': 'test@example.com'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.password_reset_token)

    def test_forgot_password_nonexistent_email(self):
        res = self.client.post('/api/auth/forgot-password/', {
            'email': 'nobody@example.com'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_reset_password_success(self):
        self.client.post('/api/auth/forgot-password/', {
            'email': 'test@example.com'
        }, format='json')
        self.user.refresh_from_db()
        token = self.user.password_reset_token

        res = self.client.post('/api/auth/reset-password/', {
            'token': token,
            'password': 'NewStrongPass123!',
            'password_confirm': 'NewStrongPass123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertIsNone(self.user.password_reset_token)

    def test_reset_password_expired_token(self):
        self.client.post('/api/auth/forgot-password/', {
            'email': 'test@example.com'
        }, format='json')
        self.user.refresh_from_db()
        self.user.password_reset_token_expires = timezone.now() - timezone.timedelta(hours=2)
        self.user.save()
        token = self.user.password_reset_token

        res = self.client.post('/api/auth/reset-password/', {
            'token': token,
            'password': 'NewStrongPass123!',
            'password_confirm': 'NewStrongPass123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class ChangePasswordTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        res = self.client.post('/api/auth/change-password/', {
            'old_password': 'StrongPass123!',
            'new_password': 'NewStrongPass456!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_change_password_wrong_old(self):
        res = self.client.post('/api/auth/change-password/', {
            'old_password': 'WrongPass',
            'new_password': 'NewStrongPass456!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class MeViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            first_name='Test',
            last_name='User',
            password='StrongPass123!'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_me(self):
        res = self.client.get('/api/users/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'test@example.com')

    def test_update_me(self):
        res = self.client.patch('/api/users/me/', {
            'first_name': 'Updated'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')

    def test_me_unauthenticated(self):
        self.client.force_authenticate(user=None)
        res = self.client.get('/api/users/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
