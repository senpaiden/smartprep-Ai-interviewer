"""Models for the notifications app."""

import uuid
from django.db import models
from accounts.models import User


class Notification(models.Model):
    """In-app notification."""

    TYPE_CHOICES = [
        ('interview_complete', 'Interview Complete'),
        ('resume_analyzed', 'Resume Analyzed'),
        ('certificate_ready', 'Certificate Ready'),
        ('interview_reminder', 'Interview Reminder'),
        ('system', 'System'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='system')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.email}"
