import json
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import HackathonSession
from .services import generate_hackathon_response, evaluate_hackathon_interview

@api_view(['POST'])
@permission_classes([AllowAny])
def interview_endpoint(request):
    try:
        data = request.data if request.data else json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    session_id = data.get('sessionId')
    if not session_id:
        return JsonResponse({'error': 'Missing sessionId'}, status=400)

    # 1. Start Interview
    if 'candidate' in data:
        candidate_data = data['candidate']
        session, created = HackathonSession.objects.get_or_create(
            session_id=session_id,
            defaults={'candidate_data': candidate_data, 'user': request.user if request.user.is_authenticated else None}
        )
        if not created:
            if not session.user and request.user.is_authenticated:
                session.user = request.user
            session.candidate_data = candidate_data
            session.conversation_history = []
            session.covered_days = []
            session.questions_asked = 0
            session.is_done = False
            session.save()

        reply = generate_hackathon_response(session)
        return JsonResponse({'reply': reply, 'done': False})

    # 2. Conversation Turn
    if 'message' in data:
        try:
            session = HackathonSession.objects.get(session_id=session_id)
        except HackathonSession.DoesNotExist:
            return JsonResponse({'error': 'Session not found'}, status=404)
            
        if session.is_done:
             return JsonResponse({'error': 'Interview already completed'}, status=400)

        # Programmatic guard: enforce 8-question minimum
        if session.questions_asked >= 8:
            session.is_done = True
            session.save()
            feedback = evaluate_hackathon_interview(session)
            return JsonResponse({
                'reply': 'Interview completed.',
                'done': True,
                'feedback': feedback
            })

        message = data['message']
        session.conversation_history.append({'role': 'user', 'content': message})
        session.save()
        
        reply = generate_hackathon_response(session, latest_message=message)
        return JsonResponse({'reply': reply, 'done': False})

    return JsonResponse({'error': 'Invalid payload'}, status=400)

@api_view(['GET', 'DELETE'])
@permission_classes([AllowAny])
def sessions_endpoint(request, session_id=None):
    if request.method == 'GET':
        if session_id:
            try:
                session = HackathonSession.objects.get(session_id=session_id)
                data = {
                    'session_id': session.session_id,
                    'candidate_data': session.candidate_data,
                    'conversation_history': session.conversation_history,
                    'questions_asked': session.questions_asked,
                    'is_done': session.is_done,
                    'created_at': session.created_at.isoformat(),
                    'updated_at': session.updated_at.isoformat()
                }
                return JsonResponse(data)
            except HackathonSession.DoesNotExist:
                return JsonResponse({'error': 'Session not found'}, status=404)
        else:
            if request.user.is_authenticated:
                sessions = HackathonSession.objects.filter(user=request.user).order_by('-created_at')
            else:
                sessions = HackathonSession.objects.filter(user__isnull=True).order_by('-created_at')
            data = []
            for session in sessions:
                member = session.candidate_data.get('member', {})
                data.append({
                    'session_id': session.session_id,
                    'candidate_name': member.get('name', 'Unknown'),
                    'candidate_role': member.get('jobRole', 'Unknown'),
                    'questions_asked': session.questions_asked,
                    'is_done': session.is_done,
                    'created_at': session.created_at.isoformat(),
                })
            return JsonResponse({'sessions': data})
    
    if request.method == 'DELETE':
        if session_id:
            try:
                session = HackathonSession.objects.get(session_id=session_id)
                session.delete()
                return JsonResponse({'message': 'Session deleted.'})
            except HackathonSession.DoesNotExist:
                return JsonResponse({'error': 'Session not found'}, status=404)
        else:
            if request.user.is_authenticated:
                HackathonSession.objects.filter(user=request.user).delete()
            else:
                HackathonSession.objects.filter(user__isnull=True).delete()
            return JsonResponse({'message': 'All sessions deleted.'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)

@api_view(['GET'])
@permission_classes([AllowAny])
def candidates_endpoint(request):
    from .services import get_candidates
    return JsonResponse({'candidates': get_candidates()})
