"""Custom User model and Profile for the accounts app."""

import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with email as primary identifier."""

    ROLE_CHOICES = [
        ('candidate', 'Candidate'),
        ('admin', 'Admin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='candidate')
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, blank=True, null=True)
    password_reset_token = models.CharField(max_length=255, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.email


class Profile(models.Model):
    """Extended profile for candidates."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    education = models.JSONField(default=list, blank=True)
    experience = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=list, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    study_plan = models.JSONField(default=dict, blank=True)
    profile_completion = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.email}"

    def calculate_completion(self):
        """Calculate profile completion percentage."""
        fields = {
            'first_name': bool(self.user.first_name),
            'last_name': bool(self.user.last_name),
            'phone': bool(self.phone),
            'bio': bool(self.bio),
            'education': bool(self.education),
            'experience': bool(self.experience),
            'skills': bool(self.skills),
            'avatar': bool(self.user.avatar),
        }
        completed = sum(fields.values())
        self.profile_completion = int((completed / len(fields)) * 100)
        return self.profile_completion
