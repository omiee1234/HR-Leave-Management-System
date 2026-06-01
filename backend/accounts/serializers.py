from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer to represent User details.
    """
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'role')
        read_only_fields = ('id',)

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer to handle User registration.
    """
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'role')
        read_only_fields = ('id',)

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'employee')
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom Serializer to include user details in JWT response.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'name': self.user.name,
            'email': self.user.email,
            'role': self.user.role,
        }
        return data
