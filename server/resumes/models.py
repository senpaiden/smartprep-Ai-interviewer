"""Models for the resumes app."""

import uuid
from django.db import models
from accounts.models import User


class Resume(models.Model):
    """Uploaded resume with AI analysis."""

    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('analyzing', 'Analyzing'),
        ('analyzed', 'Analyzed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    original_filename = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')

    # AI Analysis Results
    extracted_text = models.TextField(blank=True, default='')
    technical_skills = models.JSONField(default=list, blank=True)
    soft_skills = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    education = models.JSONField(default=list, blank=True)
    experience = models.JSONField(default=list, blank=True)

    # Scores
    ats_score = models.IntegerField(default=0)
    resume_rating = models.FloatField(default=0.0)

    # Issues & Suggestions
    missing_keywords = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    grammar_issues = models.JSONField(default=list, blank=True)
    formatting_issues = models.JSONField(default=list, blank=True)
    improvement_suggestions = models.JSONField(default=list, blank=True)
    
    # Company Match (RAG)
    company_match_status = models.CharField(max_length=50, blank=True, default='')
    company_match_reason = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.original_filename} - {self.user.email}"
