from django.urls import path
from .views import CountriesService
from authentication.views import LogoutAPIView, RegisterAPIView, LoginAPIView, UserAPIView, RefreshTokenAPIView, ForgotPasswordAPIView, ResetPasswordAPIView, VerifyTokenAPIView
from profiles.views import EditProfileAPIView, EditDevicesSettingsAPIView
from payments.views import TestPaymentAPIView, TestSubscriptionAPIView

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
    path('edit-profile', EditProfileAPIView.as_view(), name='edit-profile'),
    path('devices-settings', EditDevicesSettingsAPIView.as_view(), name='devices-settings'),
    path('test-payment', TestPaymentAPIView.as_view(), name='test-payment'),
    path('test-subscription', TestSubscriptionAPIView.as_view(), name='test-subscription'),
]
