from django.urls import path
from .views import CountriesService
from authentication.views import LogoutAPIView, RegisterAPIView, LoginAPIView, UserAPIView, RefreshTokenAPIView, ForgotPasswordAPIView, ResetPasswordAPIView, VerifyTokenAPIView, ChangePasswordAPIView
from profiles.views import EditProfileAPIView, EditDevicesSettingsAPIView
from payments.views import CreateCheckoutSessionView, StripeWebhookListener, CheckoutSessionView, GetPaymentHistoryAPIView
from subscriptions.views import GetUsersSubscriptionPlanAPIView, GetMembershipInfoAPIView

urlpatterns = [
    path('countries', CountriesService.as_view(), name='countries'),
    path('register', RegisterAPIView.as_view(), name='register'),
    path('login', LoginAPIView.as_view(), name='login'),
    path('user', UserAPIView.as_view(), name='user'),
    path('refresh', RefreshTokenAPIView.as_view(), name='refresh'),
    path('logout', LogoutAPIView.as_view(), name='logout'),
    path('change-password', ChangePasswordAPIView.as_view(), name='change-password'),
    path('forgot-password', ForgotPasswordAPIView.as_view(), name='forgot-password'),
    path('reset-password', ResetPasswordAPIView.as_view(), name='reset-password'),
    path('verify-token', VerifyTokenAPIView.as_view(), name='verify-token'),
    path('edit-profile', EditProfileAPIView.as_view(), name='edit-profile'),
    path('devices-settings', EditDevicesSettingsAPIView.as_view(), name='devices-settings'),
    path('checkout-session', CheckoutSessionView.as_view(), name='checkout-session'),
    path('create-checkout-session', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('stripe-webhooks', StripeWebhookListener.as_view(), name='stripe-webhooks'),
    path('membership', GetUsersSubscriptionPlanAPIView.as_view(), name='membership'),
    path('membership-stripe', GetMembershipInfoAPIView.as_view(), name='membership-stripe'),
    path('payment-history', GetPaymentHistoryAPIView.as_view(), name='payment-history'),
]
