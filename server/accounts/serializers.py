"""Serializers for the accounts app."""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Profile


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Create profile automatically
        Profile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(email=attrs['email'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        attrs['user'] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for the Profile model."""

    class Meta:
        model = Profile
        fields = ['phone', 'bio', 'education', 'experience', 'skills', 'social_links', 'profile_completion']
        read_only_fields = ['profile_completion']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model with nested profile."""

    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'role', 'is_email_verified', 'avatar', 'profile', 'is_staff',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'email', 'role', 'is_email_verified', 'is_staff', 'created_at', 'updated_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user basic info."""

    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'avatar', 'profile']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update profile fields
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.calculate_completion()
            profile.save()

        return instance


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password."""

    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for reset password."""

    token = serializers.CharField()
    password = serializers.CharField(validators=[validate_password])
    password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""

    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
