"""Views for the interviews app."""

from django.utils import timezone
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
import secrets
import string
from django.conf import settings
from groq import Groq

from .models import Interview, InterviewQuestion, InterviewAnswer, Certificate, Company
from .serializers import (
    InterviewSerializer, InterviewCreateSerializer,
    InterviewListSerializer, SubmitAnswerSerializer, CertificateSerializer, CompanySerializer
)
from ai_service.services import generate_interview_question, evaluate_answer, generate_interview_summary
from notifications.models import Notification


class InterviewListView(generics.ListAPIView):
    """List user's interviews."""
    serializer_class = InterviewListSerializer

    def get_queryset(self):
        return Interview.objects.filter(user=self.request.user)


class InterviewDetailView(generics.RetrieveAPIView):
    """Get interview details with questions and answers."""
    serializer_class = InterviewSerializer

    def get_queryset(self):
        return Interview.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_interview(request):
    """Start a new interview session."""
    serializer = InterviewCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    interview = Interview.objects.create(
        user=request.user,
        **serializer.validated_data,
        status='in_progress',
        started_at=timezone.now(),
    )

    # Fetch company guidelines
    company_guidelines = None
    if interview.company:
        from .models import Company
        company_obj = Company.objects.filter(name__iexact=interview.company).first()
        if company_obj and company_obj.interview_guidelines:
            company_guidelines = company_obj.interview_guidelines

    # Generate first question
    question_text = generate_interview_question(
        interview_type=interview.interview_type,
        difficulty=interview.difficulty,
        tech_stack=interview.tech_stack,
        context=[],
        question_number=1,
        total_questions=interview.total_questions,
        company_guidelines=company_guidelines,
    )

    question = InterviewQuestion.objects.create(
        interview=interview,
        question_text=question_text,
        category=interview.interview_type,
        order=1,
    )

    # Save to AI context
    interview.ai_context = [
        {"role": "assistant", "content": question_text}
    ]
    interview.current_question_index = 1
    interview.save()

    return Response({
        'interview': InterviewSerializer(interview).data,
        'current_question': {
            'id': str(question.id),
            'text': question_text,
            'number': 1,
            'total': interview.total_questions,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_answer(request, interview_id):
    """Submit an answer and get the next question."""
    try:
        interview = Interview.objects.get(id=interview_id, user=request.user)
    except Interview.DoesNotExist:
        return Response({'error': 'Interview not found.'}, status=status.HTTP_404_NOT_FOUND)

    if interview.status != 'in_progress':
        return Response({'error': 'Interview is not in progress.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = SubmitAnswerSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    answer_text = serializer.validated_data['answer_text']

    # Get current question
    current_question = interview.questions.filter(order=interview.current_question_index).first()
    if not current_question:
        return Response({'error': 'No current question found.'}, status=status.HTTP_400_BAD_REQUEST)

    # Evaluate answer with AI
    evaluation = evaluate_answer(
        question=current_question.question_text,
        answer=answer_text,
        interview_type=interview.interview_type,
        difficulty=interview.difficulty,
    )

    # Save answer
    InterviewAnswer.objects.create(
        question=current_question,
        answer_text=answer_text,
        technical_accuracy=evaluation.get('technical_accuracy', 50),
        confidence=evaluation.get('confidence', 50),
        communication=evaluation.get('communication', 50),
        grammar=evaluation.get('grammar', 50),
        vocabulary=evaluation.get('vocabulary', 50),
        fluency=evaluation.get('fluency', 50),
        relevance=evaluation.get('relevance', 50),
        completeness=evaluation.get('completeness', 50),
        problem_solving=evaluation.get('problem_solving', 50),
        feedback=evaluation.get('feedback', ''),
        strengths=evaluation.get('strengths', []),
        improvements=evaluation.get('improvements', []),
    )

    # Update AI context
    context = interview.ai_context or []
    context.append({"role": "user", "content": answer_text})

    # Check if interview is complete
    if interview.current_question_index >= interview.total_questions:
        return _complete_interview(interview, context)

    # Fetch company guidelines
    company_guidelines = None
    if interview.company:
        from .models import Company
        company_obj = Company.objects.filter(name__iexact=interview.company).first()
        if company_obj and company_obj.interview_guidelines:
            company_guidelines = company_obj.interview_guidelines

    # Generate next question
    next_number = interview.current_question_index + 1
    next_question_text = generate_interview_question(
        interview_type=interview.interview_type,
        difficulty=interview.difficulty,
        tech_stack=interview.tech_stack,
        context=context,
        question_number=next_number,
        total_questions=interview.total_questions,
        company_guidelines=company_guidelines,
    )

    next_question = InterviewQuestion.objects.create(
        interview=interview,
        question_text=next_question_text,
        category=interview.interview_type,
        order=next_number,
    )

    context.append({"role": "assistant", "content": next_question_text})
    interview.ai_context = context
    interview.current_question_index = next_number
    interview.save()


    return Response({
        'evaluation': evaluation,
        'current_question': {
            'id': str(next_question.id),
            'text': next_question_text,
            'number': next_number,
            'total': interview.total_questions,
        },
        'is_complete': False,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_interview(request, interview_id):
    """End an interview early."""
    try:
        interview = Interview.objects.get(id=interview_id, user=request.user)
    except Interview.DoesNotExist:
        return Response({'error': 'Interview not found.'}, status=status.HTTP_404_NOT_FOUND)

    if interview.status != 'in_progress':
        return Response({'error': 'Interview is not in progress.'}, status=status.HTTP_400_BAD_REQUEST)

    return _complete_interview(interview, interview.ai_context or [])


def _complete_interview(interview, context):
    """Complete an interview and calculate scores."""
    interview.status = 'completed'
    interview.completed_at = timezone.now()
    interview.ai_context = context

    # Calculate aggregate scores from all answers
    answers = InterviewAnswer.objects.filter(question__interview=interview)

    if answers.exists():
        interview.technical_score = sum(a.technical_accuracy for a in answers) / answers.count()
        interview.communication_score = sum(a.communication for a in answers) / answers.count()
        interview.confidence_score = sum(a.confidence for a in answers) / answers.count()
        interview.grammar_score = sum(a.grammar for a in answers) / answers.count()
        interview.problem_solving_score = sum(a.problem_solving for a in answers) / answers.count()
        interview.overall_score = (
            interview.technical_score + interview.communication_score +
            interview.confidence_score + interview.grammar_score +
            interview.problem_solving_score
        ) / 5

    interview.save()

    # Create certificate if score is 70 or above
    if interview.overall_score >= 70:
        unique_id = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(10))
        Certificate.objects.create(
            user=interview.user,
            interview=interview,
            unique_id=unique_id
        )

    # Create notification
    Notification.objects.create(
        user=interview.user,
        notification_type='interview_complete',
        title='Interview Completed',
        message=f'Your {interview.get_interview_type_display()} has been completed. Overall score: {interview.overall_score:.0f}%',
        link=f'/interviews/{interview.id}/results',
    )

    return Response({
        'message': 'Interview completed.',
        'interview': InterviewSerializer(interview).data,
        'is_complete': True,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def interview_stats(request):
    """Get interview statistics for dashboard."""
    user = request.user
    interviews = Interview.objects.filter(user=user)
    completed = interviews.filter(status='completed')

    total = interviews.count()
    completed_count = completed.count()
    avg_score = 0
    if completed_count > 0:
        avg_score = sum(i.overall_score for i in completed) / completed_count

    # Score breakdown
    scores = {
        'technical': 0,
        'communication': 0,
        'confidence': 0,
        'grammar': 0,
        'problem_solving': 0,
    }
    if completed_count > 0:
        scores['technical'] = sum(i.technical_score for i in completed) / completed_count
        scores['communication'] = sum(i.communication_score for i in completed) / completed_count
        scores['confidence'] = sum(i.confidence_score for i in completed) / completed_count
        scores['grammar'] = sum(i.grammar_score for i in completed) / completed_count
        scores['problem_solving'] = sum(i.problem_solving_score for i in completed) / completed_count

    # Recent interviews
    recent = InterviewListSerializer(completed[:5], many=True).data

    # Progress over time (last 7 completed interviews)
    completed_asc = interviews.filter(status='completed').order_by('completed_at')
    progress_over_time = []
    for i in completed_asc:
        progress_over_time.append({
            'day': i.completed_at.strftime('%b %d') if i.completed_at else 'Unknown',
            'score': round(i.overall_score, 1)
        })
    # Keep only last 7
    progress_over_time = progress_over_time[-7:]

    return Response({
        'total_interviews': total,
        'completed_interviews': completed_count,
        'average_score': round(avg_score, 1),
        'scores': scores,
        'recent_interviews': recent,
        'progress_over_time': progress_over_time,
    })


class CertificateListView(generics.ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user)


class CertificateDetailView(generics.RetrieveAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'
    queryset = Certificate.objects.all()

from rest_framework import viewsets
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_recording(request, interview_id):
    try:
        interview = Interview.objects.get(id=interview_id, user=request.user)
    except Interview.DoesNotExist:
        return Response({'error': 'Interview not found.'}, status=status.HTTP_404_NOT_FOUND)

    file_obj = request.FILES.get('video') or request.FILES.get('audio')
    if not file_obj:
        return Response({'error': 'No media file provided.'}, status=status.HTTP_400_BAD_REQUEST)

    # Save to media directory
    file_name = f'recordings/{interview.id}.webm'
    path = default_storage.save(file_name, ContentFile(file_obj.read()))
    
    interview.recording_url = request.build_absolute_uri(default_storage.url(path))
    interview.save()
    
    return Response({'message': 'Recording uploaded successfully.', 'url': interview.recording_url})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transcribe_audio(request):
    """Transcribe audio using Groq Whisper model."""
    if not settings.GROQ_API_KEY:
        return Response({'error': 'Groq API key not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    audio_file = request.FILES.get('audio')
    if not audio_file:
        return Response({'error': 'No audio file provided.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        
        # Pass filename and file content directly to Groq
        file_tuple = (audio_file.name, audio_file.read())
        
        transcription = client.audio.transcriptions.create(
            file=file_tuple,
            model="whisper-large-v3",
            response_format="verbose_json",
        )
        
        return Response({'text': transcription.text})
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
