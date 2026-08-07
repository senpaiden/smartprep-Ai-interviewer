"""URL configuration for the resumes app."""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.ResumeListView.as_view(), name='resume-list'),
    path('upload/', views.upload_resume, name='resume-upload'),
    path('<uuid:pk>/', views.ResumeDetailView.as_view(), name='resume-detail'),
    path('<uuid:resume_id>/analyze/', views.analyze_resume_view, name='resume-analyze'),
]
