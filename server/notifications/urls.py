"""URL configuration for the notifications app."""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', views.unread_count, name='notification-unread-count'),
    path('mark-all-read/', views.mark_all_read, name='notification-mark-all-read'),
    path('<uuid:notification_id>/read/', views.mark_read, name='notification-mark-read'),
]
