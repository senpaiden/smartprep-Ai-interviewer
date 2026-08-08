"""Views for the accounts app - Auth endpoints."""

import uuid
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail
from django.db.models import Avg, Count, Q

from .models import User, Profile
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    UserUpdateSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, ChangePasswordSerializer,
)


class RegisterView(generics.CreateAPIView):
    """Register a new user account."""

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Send verification email
        token = str(uuid.uuid4())
        user.email_verification_token = token
        user.save()

        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        send_mail(
            'Verify Your Email - Smart Interview Platform',
            f'Click the link to verify your email: {verify_url}',
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=True,
        )

        return Response({
            'message': 'Account created successfully.',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """Login with email and password."""

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Login successful.',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send password reset email."""
    serializer = ForgotPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    try:
        user = User.objects.get(email=email)
        token = str(uuid.uuid4())
        user.password_reset_token = token
        user.password_reset_token_expires = timezone.now() + timezone.timedelta(hours=1)
        user.save()

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        send_mail(
            'Reset Your Password - Smart Interview Platform',
            f'Click the link to reset your password: {reset_url}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=True,
        )
    except User.DoesNotExist:
        pass  # Don't reveal if email exists

    return Response({'message': 'If an account with that email exists, a reset link has been sent.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password using token."""
    serializer = ResetPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        user = User.objects.get(password_reset_token=serializer.validated_data['token'])
        if user.password_reset_token_expires and user.password_reset_token_expires < timezone.now():
            return Response({'error': 'Token has expired.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['password'])
        user.password_reset_token = None
        user.password_reset_token_expires = None
        user.save()
        return Response({'message': 'Password reset successfully.'})
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired token.'},
            status=status.HTTP_400_BAD_REQUEST
        )


class MeView(generics.RetrieveUpdateAPIView):
    """Get or update current user."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change password for authenticated user."""
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response(
            {'error': 'Old password is incorrect.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({'message': 'Password changed successfully.'})


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request):
    """Verify email with token."""
    token = request.query_params.get('token')
    if not token:
        return Response(
            {'error': 'Token is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email_verification_token=token)
        user.is_email_verified = True
        user.email_verification_token = None
        user.save()
        return Response({'message': 'Email verified successfully.'})
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid token.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_verification_email(request):
    """Resend verification email to current user."""
    user = request.user
    if user.is_email_verified:
        return Response(
            {'error': 'Email is already verified.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    token = str(uuid.uuid4())
    user.email_verification_token = token
    user.save()

    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    send_mail(
        'Verify Your Email - Smart Interview Platform',
        f'Click the link to verify your email: {verify_url}',
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=True,
    )

    return Response({'message': 'Verification email sent.'})


class UserListView(generics.ListAPIView):
    """Admin: list all users."""

    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return User.objects.none()
        return User.objects.all()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    """Get top users based on average interview score."""
    users = User.objects.annotate(
        completed_count=Count('interviews', filter=Q(interviews__status='completed')),
        avg_score=Avg('interviews__overall_score', filter=Q(interviews__status='completed'))
    ).filter(completed_count__gt=0).order_by('-avg_score')[:50]
    
    data = []
    for u in users:
        avatar_url = None
        if u.avatar:
            try:
                avatar_url = request.build_absolute_uri(u.avatar.url)
            except ValueError:
                pass
        data.append({
            'id': str(u.id),
            'name': f"{u.first_name} {u.last_name}".strip() or u.username,
            'avatar': avatar_url,
            'avg_score': round(u.avg_score or 0, 1),
            'interviews_done': u.completed_count
        })
    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def roadmap(request):
    """Get or generate user study plan."""
    profile = request.user.profile
    if request.method == 'GET':
        topic = request.GET.get('topic')
        if topic:
            from ai_service.services import generate_roadmap
            generated_plan = generate_roadmap(topic)
            return Response(generated_plan)

        if profile.study_plan:
            plan = profile.study_plan
            if isinstance(plan, str):
                import ast
                try:
                    plan = ast.literal_eval(plan)
                except Exception:
                    pass
            if isinstance(plan, dict) and "weak_areas" in plan:
                return Response(plan)
    study_plan = {
        "weak_areas": ["No weak areas identified yet"],
        "courses": [],
        "daily_tasks": [
            "Start by taking an interview to identify your weak areas",
            "Upload your resume for personalized feedback",
            "Check the roadmap page with a specific topic to generate a plan"
        ]
    }
    
    profile.study_plan = study_plan
    profile.save()
    
    return Response(study_plan)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard stats for current user."""
    from hackathon.models import HackathonSession
    from resumes.models import Resume
    from interviews.models import Interview
    
    user_sessions = HackathonSession.objects.filter(user=request.user)
    completed_sessions = user_sessions.filter(is_done=True).count()
    total = user_sessions.count()

    user_resumes = Resume.objects.filter(user=request.user)
    latest_resume = user_resumes.order_by('-created_at').first()
    
    resume_score = "N/A"
    ats_score = "N/A"
    if latest_resume and latest_resume.status == 'analyzed':
        resume_score = f"{latest_resume.resume_rating * 20:.0f}/100"
        ats_score = f"{latest_resume.ats_score}%"
    
    # Calculate real overall rating from completed interviews
    from django.db.models import Avg
    interview_agg = Interview.objects.filter(
        user=request.user, status='completed'
    ).aggregate(avg=Avg('overall_score'))
    avg_score = interview_agg['avg']
    overall_rating = f"{avg_score / 20:.1f}/5.0" if avg_score else "N/A"
    
    return Response({
        'resume_score': resume_score,
        'ats_score': ats_score,
        'interviews_completed': completed_sessions,
        'overall_rating': overall_rating,
        'recent_interviews': total
    })
