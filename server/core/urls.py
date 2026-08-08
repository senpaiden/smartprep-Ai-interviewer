"""Core URL configuration."""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/users/', include('accounts.user_urls')),
    path('api/resumes/', include('resumes.urls')),
    path('api/interviews/', include('interviews.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/coding/', include('coding.urls')),
    path('api/interview/', include('hackathon.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
