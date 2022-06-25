import datetime
import random
import string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import get_authorization_header
from rest_framework import exceptions, status
from .serializers import UserSerializer
from profiles.models import User
from .authentication import JWTAuthentication, create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from .models import ForgotPasswordToken, UserToken
# need to import send_email from django
from django.core.mail import send_mail


# Create your views here.
class RegisterAPIView(APIView):
    def post(self, request):
        data = request.data
        
        if data['password'] != data['password_confirm']:
            raise exceptions.APIException('Passwords do not match')
        
        serializer = UserSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        send_mail(
            from_email="example@example.com",
            recipient_list=[data['email']],
            subject="Welcome to the API",
            message="You have successfully registered for the API",
        )
        
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
        
        token = UserToken.objects.filter(token=refresh_token)
        
        if not token.exists():
            raise exceptions.AuthenticationFailed('Unauthenticated')
        
        token.delete()            
        
        response = Response()
        response.delete_cookie('refresh_token')
        response.data = {
            'success': True,
            'message': 'Logged out'
        }
        
        return response
    
    
class ForgotPasswordAPIView(APIView):
    def post(self, request):
        email = request.data['email']
        user = User.objects.filter(email=email).first()
        
        if user:            
            token = ''.join(random.choices(string.ascii_lowercase + string.ascii_uppercase + string.digits, k=32))
            
            ForgotPasswordToken.objects.create(
                email=email,
                token=token
            )
            
            url = 'http://localhost:8000/forgot-password/' + token
            
            send_mail(
                subject="Reset Password",
                message='Click the link to reset your password: ' + url,
                from_email="from@example.com",
                recipient_list=[email],
            )
            
        return Response({
            'success': True,
            'message': 'If the email you provided is associated with an account, you will receive an email with a link to reset your password.'
        })
        
        
class ResetPasswordAPIView(APIView):
    def post(self, request):
        data = request.data
        
        if data['password'] != data['password_confirm']:
            raise exceptions.APIException('Passwords do not match')
        
        reset_token = ForgotPasswordToken.objects.filter(token=data['token']).first()
        
        if not reset_token:
            raise exceptions.APIException('Invalid token')
        
        user = User.objects.filter(email=reset_token.email).first()
        
        if not user:
            raise exceptions.APIException('User not found')
        
        user.set_password(data['password'])
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password reset successfully'
        })