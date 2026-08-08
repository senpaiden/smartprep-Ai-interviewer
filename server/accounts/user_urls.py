"""User profile URL configuration."""

from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.MeView.as_view(), name='user-me'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('roadmap/', views.roadmap, name='roadmap'),
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
    path('', views.UserListView.as_view(), name='user-list'),
]
