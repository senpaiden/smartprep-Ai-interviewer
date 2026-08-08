from django.db import models
from django.conf import settings

class HackathonSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=255, unique=True, primary_key=True)
    candidate_data = models.JSONField(default=dict)
    conversation_history = models.JSONField(default=list, blank=True)
    covered_days = models.JSONField(default=list, blank=True)
    questions_asked = models.IntegerField(default=0)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"HackathonSession {self.session_id}"
