"""Views for the resumes app."""

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from PyPDF2 import PdfReader

from .models import Resume
from .serializers import ResumeSerializer, ResumeUploadSerializer
from ai_service.services import analyze_resume
from interviews.models import Company
from notifications.models import Notification


class ResumeListView(generics.ListAPIView):
    """List user's resumes."""
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete a resume."""
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    """Upload a PDF resume."""
    serializer = ResumeUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    file = serializer.validated_data['file']

    resume = Resume.objects.create(
        user=request.user,
        file=file,
        original_filename=file.name,
        status='uploaded',
    )

    return Response(ResumeSerializer(resume).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_resume_view(request, resume_id):
    """Trigger AI analysis on a resume."""
    try:
        resume = Resume.objects.get(id=resume_id, user=request.user)
    except Resume.DoesNotExist:
        return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

    if resume.status == 'analyzing':
        return Response({'error': 'Resume is already being analyzed.'}, status=status.HTTP_400_BAD_REQUEST)

    company_id = request.data.get('company_id')
    company_context = None
    if company_id:
        try:
            company = Company.objects.get(id=company_id)
            company_context = {
                'required_skills': company.required_skills,
                'resume_filter_keywords': company.resume_filter_keywords
            }
        except Company.DoesNotExist:
            pass

    resume.status = 'analyzing'
    resume.save()

    try:
        # Extract text from PDF
        reader = PdfReader(resume.file.path)
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''

        if not text.strip():
            resume.status = 'failed'
            resume.save()
            return Response({'error': 'Could not extract text from PDF.'}, status=status.HTTP_400_BAD_REQUEST)

        resume.extracted_text = text

        # AI Analysis
        analysis = analyze_resume(text, company_context=company_context)

        resume.technical_skills = analysis.get('technical_skills', [])
        resume.soft_skills = analysis.get('soft_skills', [])
        resume.projects = analysis.get('projects', [])
        resume.certifications = analysis.get('certifications', [])
        resume.education = analysis.get('education', [])
        resume.experience = analysis.get('experience', [])
        resume.ats_score = analysis.get('ats_score', 0)
        resume.resume_rating = analysis.get('resume_rating', 0.0)
        resume.missing_keywords = analysis.get('missing_keywords', [])
        resume.missing_skills = analysis.get('missing_skills', [])
        resume.grammar_issues = analysis.get('grammar_issues', [])
        resume.formatting_issues = analysis.get('formatting_issues', [])
        resume.improvement_suggestions = analysis.get('improvement_suggestions', [])
        resume.company_match_status = analysis.get('company_match_status', '')
        resume.company_match_reason = analysis.get('company_match_reason', '')
        
        resume.status = 'analyzed'
        resume.save()

        # Create notification
        Notification.objects.create(
            user=request.user,
            notification_type='resume_analyzed',
            title='Resume Analysis Complete',
            message=f'Your resume "{resume.original_filename}" has been analyzed. ATS Score: {resume.ats_score}%',
            link=f'/resume/{resume.id}',
        )

        return Response(ResumeSerializer(resume).data)

    except Exception as e:
        resume.status = 'failed'
        resume.save()
        return Response(
            {'error': f'Analysis failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
