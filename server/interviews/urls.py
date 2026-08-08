"""URL configuration for the interviews app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'companies', views.CompanyViewSet, basename='company')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', views.InterviewListView.as_view(), name='interview-list'),
    path('stats/', views.interview_stats, name='interview-stats'),
    path('start/', views.start_interview, name='interview-start'),
    path('transcribe/', views.transcribe_audio, name='interview-transcribe'),
    path('candidates/', views.candidates_list, name='interview-candidates'),
    path('<uuid:pk>/', views.InterviewDetailView.as_view(), name='interview-detail'),
    path('<uuid:interview_id>/answer/', views.submit_answer, name='interview-answer'),
    path('<uuid:interview_id>/end/', views.end_interview, name='interview-end'),
    path('<uuid:interview_id>/upload-recording/', views.upload_recording, name='interview-upload-recording'),
    path('certificates/', views.CertificateListView.as_view(), name='certificate-list'),
    path('certificates/<str:unique_id>/', views.CertificateDetailView.as_view(), name='certificate-detail'),
    path('companies/<uuid:company_id>/documents/', views.upload_company_document, name='company-upload-document'),
    path('companies/<uuid:company_id>/query/', views.query_company_knowledge, name='company-query-knowledge'),
]
