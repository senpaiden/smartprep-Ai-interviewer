"""Views for the interviews app."""

import logging
from django.utils import timezone
from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
import secrets
import string
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from .models import Interview, InterviewQuestion, InterviewAnswer, Certificate, Company, KnowledgeBaseDocument, DocumentChunk
from .serializers import (
    InterviewSerializer, InterviewCreateSerializer,
    InterviewListSerializer, SubmitAnswerSerializer, CertificateSerializer, CompanySerializer,
    KnowledgeBaseDocumentSerializer,
)
from core.pagination import StandardPagination
from .context_helpers import find_candidate, build_curriculum_context, build_resume_context, fetch_company_guidelines
from ai_service.services import generate_interview_question, evaluate_answer, generate_interview_summary
from notifications.models import Notification

logger = logging.getLogger(__name__)


class InterviewListView(generics.ListAPIView):
    """List user's interviews."""
    serializer_class = InterviewListSerializer
    pagination_class = StandardPagination

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
    company_guidelines = fetch_company_guidelines(interview.company)

    # Check if candidate-based (curriculum) interview
    candidate_id = request.data.get('candidate_id', '')
    curriculum_context = None
    resume_context = None

    if candidate_id:
        candidate = find_candidate(candidate_id)
        if candidate:
            curriculum_context = build_curriculum_context(candidate, interview)
            # Set tech_stack from candidate role if empty
            if not interview.tech_stack:
                interview.tech_stack = [candidate.get('member', {}).get('jobRole', 'AI')]
                interview.save()
    else:
        resume_context = build_resume_context(request.user, interview)

    # Generate first question
    question_text = generate_interview_question(
        interview_type=interview.interview_type,
        difficulty=interview.difficulty,
        tech_stack=interview.tech_stack,
        context=[],
        question_number=1,
        total_questions=interview.total_questions,
        company_guidelines=company_guidelines,
        resume_context=resume_context,
        curriculum_context=curriculum_context,
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
    InterviewAnswer.objects.update_or_create(
        question=current_question,
        defaults={
            'answer_text': answer_text,
            'technical_accuracy': evaluation.get('technical_accuracy', 50),
            'confidence': evaluation.get('confidence', 50),
            'communication': evaluation.get('communication', 50),
            'english_fluency': evaluation.get('english_fluency', 50),
            'grammar': evaluation.get('grammar', 50),
            'vocabulary': evaluation.get('vocabulary', 50),
            'fluency': evaluation.get('fluency', 50),
            'relevance': evaluation.get('relevance', 50),
            'completeness': evaluation.get('completeness', 50),
            'problem_solving': evaluation.get('problem_solving', 50),
            'feedback': evaluation.get('feedback', ''),
            'strengths': evaluation.get('strengths', []),
            'improvements': evaluation.get('improvements', []),
        }
    )

    # Update AI context
    context = interview.ai_context or []
    context.append({"role": "user", "content": answer_text})

    # Check if interview is complete
    if interview.current_question_index >= interview.total_questions:
        return _complete_interview(interview, context)

    # Fetch company guidelines
    company_guidelines = fetch_company_guidelines(interview.company)

    # Fetch context for personalized follow-ups
    resume_context = None
    curriculum_context = None

    if interview.candidate_id:
        candidate = find_candidate(interview.candidate_id)
        if candidate:
            curriculum_context = build_curriculum_context(candidate, interview, search_query=answer_text)
    else:
        resume_context = build_resume_context(request.user, interview)

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
        resume_context=resume_context,
        curriculum_context=curriculum_context,
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
    """Complete an interview, calculate scores, and generate AI summary."""
    interview.status = 'completed'
    interview.completed_at = timezone.now()
    interview.ai_context = context

    # Calculate aggregate scores from all answers
    answers = InterviewAnswer.objects.filter(question__interview=interview)

    if answers.exists():
        interview.technical_score = sum(a.technical_accuracy for a in answers) / answers.count()
        interview.communication_score = sum(a.communication for a in answers) / answers.count()
        interview.confidence_score = sum(a.confidence for a in answers) / answers.count()
        interview.english_fluency_score = sum(a.english_fluency for a in answers) / answers.count()
        interview.grammar_score = sum(a.grammar for a in answers) / answers.count()
        interview.problem_solving_score = sum(a.problem_solving for a in answers) / answers.count()
        interview.overall_score = (
            interview.technical_score + interview.communication_score +
            interview.confidence_score + interview.english_fluency_score +
            interview.grammar_score + interview.problem_solving_score
        ) / 6

    interview.save()

    # Generate AI summary report
    try:
        questions_data = []
        for q in interview.questions.select_related('answer').order_by('order'):
            q_data = {
                'question': q.question_text,
                'category': q.category,
                'order': q.order,
            }
            if hasattr(q, 'answer') and q.answer:
                q_data['answer'] = q.answer.answer_text
                q_data['score'] = q.answer.overall_score
                q_data['feedback'] = q.answer.feedback
                q_data['strengths'] = q.answer.strengths
                q_data['improvements'] = q.answer.improvements
            questions_data.append(q_data)

        interview_data = {
            'interview_type': interview.get_interview_type_display(),
            'difficulty': interview.difficulty,
            'role': interview.role,
            'tech_stack': interview.tech_stack,
            'total_questions': interview.total_questions,
            'questions_answered': answers.count(),
            'overall_score': interview.overall_score,
            'technical_score': interview.technical_score,
            'communication_score': interview.communication_score,
            'confidence_score': interview.confidence_score,
            'grammar_score': interview.grammar_score,
            'problem_solving_score': interview.problem_solving_score,
            'questions': questions_data,
        }

        summary = generate_interview_summary(interview_data)
        interview.ai_summary = summary
        interview.save()
    except Exception as e:
        logger.error(f"Error generating interview summary: {e}")

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

    from django.db.models import Avg, Count

    total = interviews.count()
    completed_count = completed.count()

    # Use aggregate to avoid N+1 — single DB query
    agg = completed.aggregate(
        avg_score=Avg('overall_score'),
        avg_technical=Avg('technical_score'),
        avg_communication=Avg('communication_score'),
        avg_confidence=Avg('confidence_score'),
        avg_grammar=Avg('grammar_score'),
        avg_problem_solving=Avg('problem_solving_score'),
    )

    avg_score = agg['avg_score'] or 0
    scores = {
        'technical': round(agg['avg_technical'] or 0, 1),
        'communication': round(agg['avg_communication'] or 0, 1),
        'confidence': round(agg['avg_confidence'] or 0, 1),
        'grammar': round(agg['avg_grammar'] or 0, 1),
        'problem_solving': round(agg['avg_problem_solving'] or 0, 1),
    }

    # Recent interviews
    recent = InterviewListSerializer(completed[:5], many=True).data

    # Progress over time (last 7 completed interviews)
    completed_asc = completed.order_by('completed_at')[:7]
    progress_over_time = [
        {
            'day': i.completed_at.strftime('%b %d') if i.completed_at else 'Unknown',
            'score': round(i.overall_score, 1)
        }
        for i in completed_asc
    ]

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
    pagination_class = StandardPagination

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user)


class CertificateDetailView(generics.RetrieveAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'
    queryset = Certificate.objects.all()

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
    """Transcribe audio using Groq Whisper."""
    audio_file = request.FILES.get('audio')
    if not audio_file:
        return Response({'error': 'No audio file provided.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        import groq
        client = groq.Groq(api_key=settings.GROQ_API_KEY)
        
        file_bytes = audio_file.read()
        filename = audio_file.name or 'audio.webm'
        
        transcription = client.audio.transcriptions.create(
            file=(filename, file_bytes, audio_file.content_type or 'audio/webm'),
            model="whisper-large-v3",
            language="en",
        )
        
        return Response({'text': transcription.text})
    except ImportError:
        return Response({'error': 'Groq package not installed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': f'Transcription failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def candidates_list(request):
    """List available AI Cohort candidates for curriculum-based interviews."""
    import json as json_mod
    import os
    from django.conf import settings as conf

    try:
        path = os.path.join(conf.BASE_DIR, 'hackathon_data', 'candidates.json')
        with open(path, 'r') as f:
            data = json_mod.load(f)
    except Exception:
        return Response({'candidates': []})

    candidates = []
    for c in data.get('candidates', []):
        member = c.get('member', {})
        missions = c.get('missions', [])
        weak = [m['title'] for m in missions if m.get('skipped') or m.get('attempts', 0) > 2 or m.get('passed') is False]
        candidates.append({
            'id': member.get('id', ''),
            'name': member.get('name', 'Unknown'),
            'jobRole': member.get('jobRole', ''),
            'yearsExperience': member.get('yearsExperience', 0),
            'education': member.get('education', ''),
            'missionsCount': len(missions),
            'weak_topics': weak,
        })

    return Response({'candidates': candidates})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_company_document(request, company_id):
    """Upload a company knowledge base document and chunk it for RAG."""
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found.'}, status=status.HTTP_404_NOT_FOUND)

    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

    # Save the uploaded file
    file_name = f'knowledge_base/{company_id}/{file_obj.name}'
    path = default_storage.save(file_name, ContentFile(file_obj.read()))
    file_url = default_storage.url(path)

    # Create the document record
    doc = KnowledgeBaseDocument.objects.create(
        company=company,
        filename=file_obj.name,
        file_path=file_url,
    )

    # Extract text from file
    try:
        full_path = default_storage.path(path)
        if file_obj.name.lower().endswith('.pdf'):
            import PyPDF2
            with open(full_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                raw_text = '\n'.join(
                    page.extract_text() or '' for page in reader.pages
                )
        else:
            with open(full_path, 'r', errors='ignore') as f:
                raw_text = f.read()
    except Exception as e:
        logger.error(f"Error extracting text from document: {e}")
        raw_text = ''

    # Chunk the text into ~500-char pieces
    chunk_size = 500
    chunks = []
    for i in range(0, len(raw_text), chunk_size):
        chunk_text = raw_text[i:i + chunk_size].strip()
        if chunk_text:
            chunks.append(chunk_text)

    # Create DocumentChunk records
    for idx, chunk_text in enumerate(chunks):
        embedding_text = generate_embedding_text(chunk_text)
        DocumentChunk.objects.create(
            document=doc,
            text=chunk_text,
            embedding=[],  # Placeholder — vector embedding can be added later
            chunk_index=idx,
        )

    return Response({
        'document_id': str(doc.id),
        'filename': doc.filename,
        'chunk_count': len(chunks),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def query_company_knowledge(request, company_id):
    """Query company knowledge base using simple keyword matching."""
    try:
        company = Company.objects.get(id=company_id)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found.'}, status=status.HTTP_404_NOT_FOUND)

    query = request.data.get('query', '').strip()
    if not query:
        return Response({'error': 'Query text is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Retrieve all chunks for this company
    chunks = DocumentChunk.objects.filter(
        document__company=company
    ).select_related('document')

    if not chunks.exists():
        return Response({'results': []})

    # Simple keyword matching: score each chunk by word overlap
    query_words = set(query.lower().split())
    scored = []
    for chunk in chunks:
        chunk_words = set(chunk.text.lower().split())
        overlap = len(query_words & chunk_words)
        if overlap > 0:
            scored.append((overlap, chunk))

    # Sort by score descending, take top 5
    scored.sort(key=lambda x: x[0], reverse=True)
    top_chunks = scored[:5]

    results = [
        {
            'chunk_id': str(chunk.id),
            'document_id': str(chunk.document.id),
            'document_filename': chunk.document.filename,
            'text': chunk.text,
            'chunk_index': chunk.chunk_index,
            'relevance_score': score,
        }
        for score, chunk in top_chunks
    ]

    return Response({'results': results})
