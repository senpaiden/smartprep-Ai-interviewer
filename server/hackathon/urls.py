from django.urls import path
from . import views

urlpatterns = [
    path('', views.interview_endpoint, name='hackathon_interview'),
    path('sessions/', views.sessions_endpoint, name='hackathon_sessions'),
    path('sessions/<str:session_id>/', views.sessions_endpoint, name='hackathon_session_detail'),
    path('candidates/', views.candidates_endpoint, name='hackathon_candidates'),
]
