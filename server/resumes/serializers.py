"""Serializers for the resumes app."""

from rest_framework import serializers
from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            'id', 'original_filename', 'status', 'technical_skills',
            'soft_skills', 'projects', 'certifications', 'education',
            'experience', 'ats_score', 'resume_rating', 'missing_keywords',
            'missing_skills', 'grammar_issues', 'formatting_issues',
            'improvement_suggestions', 'company_match_status',
            'company_match_reason', 'created_at', 'updated_at',
        ]
        read_only_fields = fields


class ResumeUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()

    class Meta:
        model = Resume
        fields = ['file']

    def validate_file(self, value):
        if not value.name.endswith('.pdf'):
            raise serializers.ValidationError('Only PDF files are allowed.')
        if value.size > 5 * 1024 * 1024:  # 5MB limit
            raise serializers.ValidationError('File size must be under 5MB.')
        return value
