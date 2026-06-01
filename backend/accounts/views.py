from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer

class RegisterView(APIView):
    """
    API view to register new Users (both employees and managers).
    Publicly accessible.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    API view to authenticate a user using email and password,
    returning access and refresh tokens, plus user metadata.
    """
    serializer_class = CustomTokenObtainPairSerializer
