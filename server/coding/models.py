"""Models for the coding app — challenges and submissions."""

import uuid
from django.db import models
from accounts.models import User


class CodingChallenge(models.Model):
    """A coding challenge/problem."""

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('practice', 'Practice'),
    ]

    CATEGORY_CHOICES = [
        ('arrays', 'Arrays'),
        ('strings', 'Strings'),
        ('linked_lists', 'Linked Lists'),
        ('trees', 'Trees'),
        ('graphs', 'Graphs'),
        ('dp', 'Dynamic Programming'),
        ('sorting', 'Sorting'),
        ('searching', 'Searching'),
        ('math', 'Math'),
        ('greedy', 'Greedy'),
        ('backtracking', 'Backtracking'),
        ('stacks_queues', 'Stacks & Queues'),
        ('hash_tables', 'Hash Tables'),
        ('recursion', 'Recursion'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='practice')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    tags = models.JSONField(default=list, blank=True)

    # Constraints
    time_limit_ms = models.IntegerField(default=2000)  # 2 seconds
    memory_limit_kb = models.IntegerField(default=262144)  # 256 MB

    # Starter code per language
    starter_code = models.JSONField(default=dict, blank=True)
    # e.g. {"python": "def solution(nums):\n    pass", "javascript": "function solution(nums) {\n\n}"}

    # Test cases
    public_test_cases = models.JSONField(default=list, blank=True)
    # e.g. [{"input": "[1,2,3]", "expected_output": "6", "explanation": "Sum of array"}]

    hidden_test_cases = models.JSONField(default=list, blank=True)
    # Same format, but not shown to user

    # Solution reference
    solution_code = models.TextField(blank=True, default='')
    solution_explanation = models.TextField(blank=True, default='')

    # Hints
    hints = models.JSONField(default=list, blank=True)

    # Stats
    total_submissions = models.IntegerField(default=0)
    accepted_submissions = models.IntegerField(default=0)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['difficulty', '-created_at']

    def __str__(self):
        return f"[{self.difficulty}] {self.title}"

    @property
    def acceptance_rate(self):
        if self.total_submissions == 0:
            return 0
        return round((self.accepted_submissions / self.total_submissions) * 100, 1)


class CodingSubmission(models.Model):
    """A user's code submission to a challenge."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('accepted', 'Accepted'),
        ('wrong_answer', 'Wrong Answer'),
        ('time_limit', 'Time Limit Exceeded'),
        ('memory_limit', 'Memory Limit Exceeded'),
        ('runtime_error', 'Runtime Error'),
        ('compilation_error', 'Compilation Error'),
    ]

    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('javascript', 'JavaScript'),
        ('java', 'Java'),
        ('cpp', 'C++'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coding_submissions')
    challenge = models.ForeignKey(CodingChallenge, on_delete=models.CASCADE, related_name='submissions')
    code = models.TextField()
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Execution results
    execution_time_ms = models.IntegerField(null=True, blank=True)
    memory_used_kb = models.IntegerField(null=True, blank=True)
    test_results = models.JSONField(default=list, blank=True)
    # e.g. [{"test_case": 1, "passed": true, "output": "6", "expected": "6", "time_ms": 12}]

    total_tests = models.IntegerField(default=0)
    passed_tests = models.IntegerField(default=0)

    # Output / errors
    stdout = models.TextField(blank=True, default='')
    stderr = models.TextField(blank=True, default='')
    compile_output = models.TextField(blank=True, default='')

    # AI Code Review (optional)
    ai_review = models.TextField(blank=True, default='')
    code_quality_score = models.IntegerField(default=0)  # 0-100
    complexity_analysis = models.CharField(max_length=50, blank=True, default='')
    optimization_suggestions = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.challenge.title} - {self.status}"

    @property
    def score(self):
        if self.total_tests == 0:
            return 0
        return round((self.passed_tests / self.total_tests) * 100, 1)
