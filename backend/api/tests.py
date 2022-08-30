from django.test import TestCase, SimpleTestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse, resolve
from .views import CountriesService
from authentication.views import (
    LogoutAPIView,
    RegisterAPIView,
    LoginAPIView,
    UserAPIView,
    RefreshTokenAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    VerifyTokenAPIView,
    ChangePasswordAPIView,
)
from profiles.views import EditProfileAPIView, EditDevicesSettingsAPIView
from payments.views import (
    CreateCheckoutSessionView,
    StripeWebhookListener,
    CheckoutSessionView,
    GetPaymentHistoryAPIView,
    CreateCustomerPortalSession,
    CancelSubscriptionAPIView,
)
from subscriptions.views import (
    GetUsersSubscriptionPlanAPIView,
    GetMembershipInfoAPIView,
)
from contactus.views import (
    ContactUsAPIView,
    NewsletterSubscriptionAPIView,
    UnsubscribeNewsletterAPIView,
)
from django_countries.data import COUNTRIES


class TestApiUrls(SimpleTestCase):
    def test_countries_url_is_resolved(self):
        url = reverse("countries")
        self.assertEquals(resolve(url).func.view_class, CountriesService)

    def test_register_url_is_resolved(self):
        url = reverse("register")
        self.assertEquals(resolve(url).func.view_class, RegisterAPIView)

    def test_login_url_is_resolved(self):
        url = reverse("login")
        self.assertEquals(resolve(url).func.view_class, LoginAPIView)

    def test_user_url_is_resolved(self):
        url = reverse("user")
        self.assertEquals(resolve(url).func.view_class, UserAPIView)

    def test_refresh_url_is_resolved(self):
        url = reverse("refresh")
        self.assertEquals(resolve(url).func.view_class, RefreshTokenAPIView)

    def test_logout_url_is_resolved(self):
        url = reverse("logout")
        self.assertEquals(resolve(url).func.view_class, LogoutAPIView)

    def test_change_password_url_is_resolved(self):
        url = reverse("change-password")
        self.assertEquals(resolve(url).func.view_class, ChangePasswordAPIView)

    def test_forgot_password_url_is_resolved(self):
        url = reverse("forgot-password")
        self.assertEquals(resolve(url).func.view_class, ForgotPasswordAPIView)

    def test_reset_password_url_is_resolved(self):
        url = reverse("reset-password")
        self.assertEquals(resolve(url).func.view_class, ResetPasswordAPIView)

    def test_verify_token_url_is_resolved(self):
        url = reverse("verify-token")
        self.assertEquals(resolve(url).func.view_class, VerifyTokenAPIView)

    def test_edit_profile_url_is_resolved(self):
        url = reverse("edit-profile")
        self.assertEquals(resolve(url).func.view_class, EditProfileAPIView)

    def test_devices_settings_url_is_resolved(self):
        url = reverse("devices-settings")
        self.assertEquals(
            resolve(url).func.view_class,
            EditDevicesSettingsAPIView
            )

    def test_checkout_session_url_is_resolved(self):
        url = reverse("checkout-session")
        self.assertEquals(resolve(url).func.view_class, CheckoutSessionView)

    def test_create_checkout_session_url_is_resolved(self):
        url = reverse("create-checkout-session")
        self.assertEquals(
            resolve(url).func.view_class,
            CreateCheckoutSessionView
            )

    def test_stripe_webhooks_url_is_resolved(self):
        url = reverse("stripe-webhooks")
        self.assertEquals(resolve(url).func.view_class, StripeWebhookListener)

    def test_membership_url_is_resolved(self):
        url = reverse("membership")
        self.assertEquals(
            resolve(url).func.view_class,
            GetUsersSubscriptionPlanAPIView
            )

    def test_membership_stripe_url_is_resolved(self):
        url = reverse("membership-stripe")
        self.assertEquals(
            resolve(url).func.view_class,
            GetMembershipInfoAPIView
            )

    def test_payment_history_url_is_resolved(self):
        url = reverse("payment-history")
        self.assertEquals(
            resolve(url).func.view_class,
            GetPaymentHistoryAPIView
            )

    def test_customer_portal_url_is_resolved(self):
        url = reverse("customer-portal")
        self.assertEquals(
            resolve(url).func.view_class,
            CreateCustomerPortalSession
            )

    def test_cancel_subscription_url_is_resolved(self):
        url = reverse("cancel-subscription")
        self.assertEquals(
            resolve(url).func.view_class,
            CancelSubscriptionAPIView
            )

    def test_contact_us_url_is_resolved(self):
        url = reverse("contact-us")
        self.assertEquals(resolve(url).func.view_class, ContactUsAPIView)

    def test_newsletter_subscription_url_is_resolved(self):
        url = reverse("newsletter-subscription")
        self.assertEquals(
            resolve(url).func.view_class,
            NewsletterSubscriptionAPIView
            )

    def test_newsletter_unsubscribe_url_is_resolved(self):
        url = reverse("newsletter-unsubscribe")
        self.assertEquals(
            resolve(url).func.view_class,
            UnsubscribeNewsletterAPIView
            )


class TestViews(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.countries_url = reverse("countries")

    def test_countries_view(self):
        response = self.client.get(self.countries_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, list(COUNTRIES.values()))
