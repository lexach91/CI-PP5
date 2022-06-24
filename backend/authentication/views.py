import datetime
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import get_authorization_header
from rest_framework import exceptions, status
from .serializers import UserSerializer
from profiles.models import User
from .authentication import JWTAuthentication, create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from .models import UserToken


# Create your views here.
class RegisterAPIView(APIView):
    def post(self, request):
        data = request.data
        
        if data['password'] != data['password_confirm']:
            raise exceptions.APIException('Passwords do not match')
        
        serializer = UserSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class LoginAPIView(APIView):
    def post(self, request):
        email = request.data['email']
        password = request.data['password']
        
        user = User.objects.filter(email=email).first()
        
        if user is None:
            raise exceptions.AuthenticationFailed('Invalid credentials')
        
        if not user.check_password(password):
            raise exceptions.AuthenticationFailed('Invalid credentials')
        
        
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        
        UserToken.objects.create(
            user_id=user.id,
            token=refresh_token,
            expired_at=datetime.datetime.utcnow() + datetime.timedelta(days=7)
        )
        
        response = Response()
        
        
        response.set_cookie(key='refresh_token', value=refresh_token, httponly=True)
        response.data = {
            'token': access_token
        }
        
        
        return response
    
    
class UserAPIView(APIView):
    
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    
    
class RefreshTokenAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        id = decode_refresh_token(refresh_token)
        
        if not UserToken.objects.filter(
            user_id=id,
            token=refresh_token,
            expired_at__gt=datetime.datetime.now(tz=datetime.timezone.utc)
        ).exists():
            raise exceptions.AuthenticationFailed('Unauthenticated')
        
        access_token = create_access_token(id)
        
        return Response({
            'token': access_token
        })
        
        
class LogoutAPIView(APIView):
    def post(self, request):
        
        refresh_token = request.COOKIES.get('refresh_token')
        
        UserToken.objects.filter(token=refresh_token).delete()
            
        
        response = Response()
        response.delete_cookie('refresh_token')
        response.data = {
            'success': True,
            'message': 'Logged out'
        }
        
        return response