"""Views for the accounts app - Auth endpoints."""

import uuid
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
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
def google_auth(request):
    """Handle Google OAuth login/signup."""
    google_id = request.data.get('google_id')
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    avatar_url = request.data.get('avatar_url', '')

    if not google_id or not email:
        return Response(
            {'error': 'google_id and email are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Try to find existing user
    try:
        user = User.objects.get(google_id=google_id)
    except User.DoesNotExist:
        try:
            user = User.objects.get(email=email)
            user.google_id = google_id
            user.save()
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create(
                email=email,
                username=email.split('@')[0] + str(uuid.uuid4())[:4],
                first_name=first_name,
                last_name=last_name,
                google_id=google_id,
                is_email_verified=True,
            )
            user.set_unusable_password()
            user.save()
            Profile.objects.create(user=user)

    refresh = RefreshToken.for_user(user)

    return Response({
        'message': 'Google login successful.',
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
        user.set_password(serializer.validated_data['password'])
        user.password_reset_token = None
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
        "weak_areas": ["System Design Architecture", "Advanced Dynamic Programming", "Behavioral Context"],
        "courses": [
            {"title": "Grokking the System Design Interview", "url": "#", "type": "Course"},
            {"title": "Mastering Dynamic Programming", "url": "#", "type": "Course"},
            {"title": "Cracking the Coding Interview", "url": "#", "type": "Book"}
        ],
        "daily_tasks": [
            "Solve 1 Medium LeetCode DP problem",
            "Read 1 chapter on Distributed Systems",
            "Practice the STAR method for behavioral questions for 15 mins"
        ]
    }
    
    profile.study_plan = study_plan
    profile.save()
    
    return Response(study_plan)
