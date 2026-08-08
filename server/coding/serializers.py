from rest_framework import serializers
from .models import CodingChallenge, CodingSubmission

class CodingChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodingChallenge
        fields = [
            'id', 'title', 'description', 'difficulty', 'frequency',
            'category', 'tags', 'time_limit_ms', 'memory_limit_kb',
            'starter_code', 'public_test_cases', 'hints',
            'total_submissions', 'accepted_submissions', 'acceptance_rate',
            'created_at'
        ]
        read_only_fields = ['total_submissions', 'accepted_submissions', 'acceptance_rate', 'created_at']

class CodingSubmissionSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    score = serializers.SerializerMethodField()
    
    class Meta:
        model = CodingSubmission
        fields = [
            'id', 'challenge', 'challenge_title', 'code', 'language',
            'status', 'execution_time_ms', 'memory_used_kb',
            'test_results', 'total_tests', 'passed_tests', 'score',
            'stdout', 'stderr', 'compile_output',
            'ai_review', 'code_quality_score', 'complexity_analysis',
            'optimization_suggestions', 'created_at'
        ]
        read_only_fields = [
            'status', 'execution_time_ms', 'memory_used_kb',
            'test_results', 'total_tests', 'passed_tests',
            'stdout', 'stderr', 'compile_output',
            'ai_review', 'code_quality_score', 'complexity_analysis',
            'optimization_suggestions', 'created_at'
        ]

    def get_score(self, obj):
        return obj.score
