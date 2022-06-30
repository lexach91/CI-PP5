from django.urls import path
from .views import CountriesService
from authentication.views import LogoutAPIView, RegisterAPIView, LoginAPIView, UserAPIView, RefreshTokenAPIView, ForgotPasswordAPIView, ResetPasswordAPIView, VerifyTokenAPIView


urlpatterns = [
    path('countries', CountriesService.as_view(), name='countries'),
    path('register', RegisterAPIView.as_view(), name='register'),
    path('login', LoginAPIView.as_view(), name='login'),
    path('user', UserAPIView.as_view(), name='user'),
    path('refresh', RefreshTokenAPIView.as_view(), name='refresh'),
    path('logout', LogoutAPIView.as_view(), name='logout'),
    path('forgot-password', ForgotPasswordAPIView.as_view(), name='forgot-password'),
    path('reset-password', ResetPasswordAPIView.as_view(), name='reset-password'),
    path('verify-token', VerifyTokenAPIView.as_view(), name='verify-token'),
]
