from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com', username='testuser', password='testpass123'
        )

    def test_create_notification(self):
        n = Notification.objects.create(
            user=self.user,
            notification_type='interview_complete',
            title='Test',
            message='Test message',
            link='/test',
        )
        self.assertEqual(n.title, 'Test')
        self.assertFalse(n.is_read)

    def test_str(self):
        n = Notification.objects.create(
            user=self.user, notification_type='test', title='Hello', message='World'
        )
        self.assertIn('Hello', str(n))
