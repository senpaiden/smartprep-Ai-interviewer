from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CodingChallengeViewSet, CodingSubmissionViewSet

router = DefaultRouter()
router.register(r'challenges', CodingChallengeViewSet, basename='challenge')
router.register(r'submissions', CodingSubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
]
