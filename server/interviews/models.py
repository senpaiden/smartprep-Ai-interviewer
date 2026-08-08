"""Models for the interviews app."""

import uuid
from django.db import models
from accounts.models import User


class Company(models.Model):
    """A company profile for company-specific interviews."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    logo_url = models.URLField(blank=True, default='')
    industry = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')
    
    # RAG / Company specific interview context
    required_skills = models.JSONField(default=list, blank=True)
    resume_filter_keywords = models.TextField(blank=True, default='', help_text='Keywords to accept/reject resumes')
    interview_guidelines = models.TextField(blank=True, default='', help_text='Guideline on question types (e.g., tough DSA, practical projects)')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class CompanyInterviewSet(models.Model):
    """A pre-built interview set for a specific company."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='interview_sets')
    title = models.CharField(max_length=200)
    round_type = models.CharField(max_length=50) # e.g. HR, Technical, Coding, Behavioral
    difficulty = models.CharField(max_length=20, default='medium')
    questions = models.JSONField(default=list) # Array of question strings
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['company', 'round_type']
        
    def __str__(self):
        return f"{self.company.name} - {self.title}"


class KnowledgeBaseDocument(models.Model):
    """A document containing company-specific knowledge."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='knowledge_docs')
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.company.name} - {self.filename}"

class DocumentChunk(models.Model):
    """A chunk of text from a knowledge base document with its vector embedding."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(KnowledgeBaseDocument, on_delete=models.CASCADE, related_name='chunks')
    text = models.TextField()
    embedding = models.JSONField() # Store array of floats representing the embedding vector
    chunk_index = models.IntegerField()
    
    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.document.filename}"


class Interview(models.Model):
    """An interview session."""

    TYPE_CHOICES = [
        ('hr', 'HR Interview'),
        ('technical', 'Technical Interview'),
        ('coding', 'Coding Interview'),
        ('behavioral', 'Behavioral Interview'),
        ('company_specific', 'Company Specific'),
        ('custom', 'Custom Interview'),
    ]

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    STATUS_CHOICES = [
        ('setup', 'Setup'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interviews')
    interview_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='setup')

    # Settings
    duration_minutes = models.IntegerField(default=30)
    total_questions = models.IntegerField(default=10)
    language = models.CharField(max_length=50, default='English')
    tech_stack = models.JSONField(default=list, blank=True)
    company = models.CharField(max_length=100, blank=True, default='')
    role = models.CharField(max_length=100, blank=True, default='')
    candidate_id = models.CharField(max_length=50, blank=True, default='')
    covered_days = models.JSONField(default=list, blank=True)

    # Results
    overall_score = models.FloatField(default=0.0)
    technical_score = models.FloatField(default=0.0)
    communication_score = models.FloatField(default=0.0)
    english_fluency_score = models.FloatField(default=0.0)
    confidence_score = models.FloatField(default=0.0)
    grammar_score = models.FloatField(default=0.0)
    problem_solving_score = models.FloatField(default=0.0)

    # AI Context (stored conversation history for context-aware follow-ups)
    ai_context = models.JSONField(default=list, blank=True)

    # AI Summary Report (generated on completion)
    ai_summary = models.JSONField(default=dict, blank=True)

    current_question_index = models.IntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Recording
    recording_url = models.URLField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.interview_type} - {self.user.email} - {self.status}"


class InterviewQuestion(models.Model):
    """A question within an interview."""

    CATEGORY_CHOICES = [
        ('hr', 'HR'),
        ('technical', 'Technical'),
        ('coding', 'Coding'),
        ('behavioral', 'Behavioral'),
        ('situational', 'Situational'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='technical')
    order = models.IntegerField(default=0)
    is_follow_up = models.BooleanField(default=False)

    # Expected answer (for evaluation reference)
    expected_answer_points = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class InterviewAnswer(models.Model):
    """A candidate's answer to a question."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.OneToOneField(InterviewQuestion, on_delete=models.CASCADE, related_name='answer')
    answer_text = models.TextField()

    # AI Evaluation Scores (0-100)
    technical_accuracy = models.FloatField(default=0.0)
    confidence = models.FloatField(default=0.0)
    communication = models.FloatField(default=0.0)
    english_fluency = models.FloatField(default=0.0)
    grammar = models.FloatField(default=0.0)
    vocabulary = models.FloatField(default=0.0)
    fluency = models.FloatField(default=0.0)
    relevance = models.FloatField(default=0.0)
    completeness = models.FloatField(default=0.0)
    problem_solving = models.FloatField(default=0.0)

    # AI Feedback
    feedback = models.TextField(blank=True, default='')
    strengths = models.JSONField(default=list, blank=True)
    improvements = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer to Q{self.question.order}"

    @property
    def overall_score(self):
        scores = [
            self.technical_accuracy, self.confidence, self.communication,
            self.english_fluency, self.relevance, self.completeness, self.problem_solving
        ]
        return sum(scores) / len(scores) if scores else 0


class Certificate(models.Model):
    """A certificate issued to a candidate for a completed interview."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    interview = models.OneToOneField(Interview, on_delete=models.CASCADE, related_name='certificate')
    unique_id = models.CharField(max_length=50, unique=True)
    issue_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-issue_date']
        
    def __str__(self):
        return f"Certificate {self.unique_id} - {self.user.email}"
