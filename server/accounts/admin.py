from django.contrib import admin
from .models import User, Profile


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'is_email_verified', 'created_at']
    list_filter = ['role', 'is_email_verified', 'is_active']
    search_fields = ['email', 'username', 'first_name', 'last_name']


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'profile_completion', 'created_at']
    search_fields = ['user__email']
