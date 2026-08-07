from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Avg
from accounts.models import User
from interviews.models import Interview, Certificate
from django.utils import timezone
from datetime import timedelta

class AdminAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        
        total_users = User.objects.count()
        new_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()
        
        total_interviews = Interview.objects.count()
        completed_interviews = Interview.objects.filter(status='completed').count()
        
        avg_score = Interview.objects.filter(status='completed').aggregate(Avg('overall_score'))['overall_score__avg'] or 0
        
        total_certificates = Certificate.objects.count()

        return Response({
            'total_users': total_users,
            'new_users_30d': new_users,
            'total_interviews': total_interviews,
            'completed_interviews': completed_interviews,
            'avg_score': round(avg_score, 1),
            'total_certificates': total_certificates
        })

from rest_framework import generics
from .serializers import UserSerializer

class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

class AdminUserUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserSerializer
