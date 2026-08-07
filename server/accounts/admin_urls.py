from django.urls import path
from . import admin_views

urlpatterns = [
    path('analytics/', admin_views.AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('users/', admin_views.AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<uuid:pk>/', admin_views.AdminUserUpdateView.as_view(), name='admin-user-update'),
]
