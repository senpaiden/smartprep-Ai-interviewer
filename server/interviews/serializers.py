"""Serializers for the interviews app."""

from rest_framework import serializers
from .models import Interview, InterviewQuestion, InterviewAnswer, Certificate, Company, CompanyInterviewSet, KnowledgeBaseDocument


class InterviewAnswerSerializer(serializers.ModelSerializer):
    overall_score = serializers.FloatField(read_only=True)

    class Meta:
        model = InterviewAnswer
        fields = [
            'id', 'answer_text', 'technical_accuracy', 'confidence',
            'communication', 'grammar', 'vocabulary', 'fluency',
            'english_fluency', 'relevance', 'completeness', 'problem_solving',
            'feedback', 'strengths', 'improvements', 'overall_score',
            'created_at',
        ]
        read_only_fields = [
            'technical_accuracy', 'confidence', 'communication',
            'grammar', 'vocabulary', 'fluency', 'english_fluency', 'relevance',
            'completeness', 'problem_solving', 'feedback',
            'strengths', 'improvements',
        ]


class InterviewQuestionSerializer(serializers.ModelSerializer):
    answer = InterviewAnswerSerializer(read_only=True)

    class Meta:
        model = InterviewQuestion
        fields = [
            'id', 'question_text', 'category', 'order',
            'is_follow_up', 'answer', 'created_at',
        ]


class InterviewSerializer(serializers.ModelSerializer):
    questions = InterviewQuestionSerializer(many=True, read_only=True)
    questions_answered = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = [
            'id', 'interview_type', 'difficulty', 'status',
            'duration_minutes', 'total_questions', 'language',
            'tech_stack', 'company', 'role', 'candidate_id', 'covered_days',
            'overall_score', 'technical_score',
            'communication_score', 'confidence_score', 'grammar_score',
            'english_fluency_score', 'problem_solving_score', 'recording_url',
            'current_question_index', 'ai_summary',
            'started_at', 'completed_at', 'created_at', 'questions',
            'questions_answered',
        ]
        read_only_fields = [
            'status', 'overall_score', 'technical_score',
            'communication_score', 'confidence_score', 'grammar_score',
            'english_fluency_score', 'problem_solving_score', 'recording_url',
            'current_question_index', 'ai_summary',
            'started_at', 'completed_at',
        ]

    def get_questions_answered(self, obj):
        return obj.questions.filter(answer__isnull=False).count()


class InterviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = [
            'interview_type', 'difficulty', 'duration_minutes',
            'total_questions', 'language', 'tech_stack', 'company', 'role',
            'candidate_id',
        ]


class InterviewListSerializer(serializers.ModelSerializer):
    questions_answered = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = [
            'id', 'interview_type', 'difficulty', 'status',
            'duration_minutes', 'total_questions', 'overall_score',
            'current_question_index', 'started_at', 'completed_at',
            'created_at', 'questions_answered', 'company', 'role',
        ]

    def get_questions_answered(self, obj):
        return obj.questions.filter(answer__isnull=False).count()


class SubmitAnswerSerializer(serializers.Serializer):
    answer_text = serializers.CharField()


class CertificateSerializer(serializers.ModelSerializer):
    interview_type = serializers.CharField(source='interview.interview_type', read_only=True)
    overall_score = serializers.FloatField(source='interview.overall_score', read_only=True)
    candidate_name = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ['id', 'unique_id', 'issue_date', 'interview_type', 'overall_score', 'candidate_name', 'interview']
        
    def get_candidate_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


class CompanyInterviewSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyInterviewSet
        fields = ['id', 'title', 'round_type', 'difficulty', 'questions']


class CompanySerializer(serializers.ModelSerializer):
    interview_sets = CompanyInterviewSetSerializer(many=True, read_only=True)
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'logo_url', 'industry', 'description', 'interview_sets']


class KnowledgeBaseDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeBaseDocument
        fields = ['id', 'filename', 'file_path', 'created_at']
        read_only_fields = ['id', 'filename', 'file_path', 'created_at']
