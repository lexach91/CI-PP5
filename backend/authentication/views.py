import datetime
import random
import string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from profiles.models import User
from .authentication import JWTAuthentication, create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from .models import ForgotPasswordToken, UserToken
# need to import send_email from django
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

base_url = settings.BASE_URL


# Create your views here.
class RegisterAPIView(APIView):
    def post(self, request):
        data = request.data
        
        if data['password'] != data['password_confirm']:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UserSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        send_mail(
            from_email="dr.meetings@hotmail.com",
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
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.check_password(password):
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)
        
        request_access_token = request.COOKIES.get('access_token')
        request_refresh_token = request.COOKIES.get('refresh_token')
        
        if request_access_token or request_refresh_token:
            return Response({'error': 'You are already logged in'}, status=status.HTTP_400_BAD_REQUEST)
        
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        
        # UserToken.objects.create(
        #     user_id=user.id,
        #     token=refresh_token,
        #     expired_at=datetime.datetime.utcnow() + datetime.timedelta(days=7)
        # )
        
        response = Response()
        
        
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            expires=datetime.datetime.utcnow() + datetime.timedelta(days=7)
        )
        
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            expires=datetime.datetime.utcnow() + datetime.timedelta(seconds=600)
        )
        
        response.status_code = status.HTTP_200_OK
        
        return response
        
        
class VerifyTokenAPIView(APIView):
    authentication_classes = (JWTAuthentication,)
    
    def get(self, request):
        return Response({'success': True})
        
    
    
class UserAPIView(APIView):
    
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        if user is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UserSerializer(user)
        data = serializer.data
        if user.avatar:
            data['avatar'] = user.avatar.url
        return Response(data, status=status.HTTP_200_OK)
        # return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
    
    
class RefreshTokenAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response({'error': 'No refresh token'}, status=status.HTTP_400_BAD_REQUEST)
        
        id = decode_refresh_token(refresh_token)
        
        if not id:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
        # if not UserToken.objects.filter(
        #     user_id=id,
        #     token=refresh_token,
        #     expired_at__gt=datetime.datetime.now(tz=datetime.timezone.utc)
        # ).exists():
        #     raise exceptions.AuthenticationFailed('Unauthenticated')
        
        access_token = create_access_token(id)
        
        response = Response()
        
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            expires=datetime.datetime.utcnow() + datetime.timedelta(seconds=600)
        )
        
        response.status_code = status.HTTP_200_OK
        
        return response
        
        
class LogoutAPIView(APIView):
    def post(self, request):
        print(request.COOKIES)
        
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response({'error': 'No refresh token'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not access_token:
            return Response({'error': 'No access token'}, status=status.HTTP_400_BAD_REQUEST)
        
        id = decode_refresh_token(refresh_token)
        
        if not id:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        response = Response()
        response.delete_cookie('refresh_token')
        response.delete_cookie('access_token')
        response.data = {
            'success': True,
            'message': 'Logged out'
        }
        response.status_code = status.HTTP_200_OK
        
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
            
            url = base_url + '/reset-password/' + token
            subject = 'Reset Password'
            name = f"{user.first_name} {user.last_name}"
            html_message = render_to_string('authentication/reset_password_email.html', {'link': url, 'name': name})
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email="dr.meetings@hotmail.com",
                recipient_list=[email],
                html_message=html_message,
            )
            
            # send_mail(
            #     subject="Reset Password",
            #     message='Click the link to reset your password: ' + url,
            #     from_email="dr.meetings@hotmail.com",
            #     recipient_list=[email],
            # )
            
        return Response({
            'success': True,
            'message': 'If the email you provided is associated with an account, you will receive an email with a link to reset your password.'
        }, status=status.HTTP_200_OK)
        
        
class ResetPasswordAPIView(APIView):
    def post(self, request):
        data = request.data
        
        if data['password'] != data['password_confirm']:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        
        reset_token = ForgotPasswordToken.objects.filter(token=data['token']).first()
        
        if not reset_token:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=reset_token.email).first()
        
        if not user:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(data['password'])
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password reset successfully'
        }, status=status.HTTP_200_OK)
        
        
class ChangePasswordAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    def post(self, request):
        user = request.user
        if not user:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        
        if not user.check_password(data['old_password']):
            return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        if data['new_password'] != data['confirm_password']:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.check_password(data['new_password']):
            return Response({'error': 'New password cannot be the same as old password'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(data['new_password'])
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
