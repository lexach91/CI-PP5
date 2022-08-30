from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse, resolve
from profiles.models import User


class TestAuthenticationViews(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.user_url = reverse("user")
        self.refresh_url = reverse("refresh")
        self.logout_url = reverse("logout")
        self.forgot_password_url = reverse("forgot-password")
        self.reset_password_url = reverse("reset-password")
        self.verify_token_url = reverse("verify-token")
        self.change_password_url = reverse("change-password")

        self.user_data = {
            "email": "test@test.com",
            "password": "test1234",
            "password_confirm": "test1234",
            "first_name": "test",
            "last_name": "test",
            "country": "country",
            "birth_date": "1990-01-01",
        }

    def test_register_user(self):
        response = self.client.post(
            self.register_url, self.user_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], self.user_data["email"])
        self.assertEqual(
            response.data["first_name"], self.user_data["first_name"]
        )
        self.assertEqual(
            response.data["last_name"], self.user_data["last_name"]
        )
        self.assertEqual(response.data["country"], self.user_data["country"])
        self.assertEqual(
            response.data["birth_date"], self.user_data["birth_date"]
        )
        wrong_data = {
            "email": "",
            "password": "",
            "password_confirm": "",
            "first_name": "",
            "last_name": "",
            "country": "",
            "birth_date": "",
        }
        response = self.client.post(
            self.register_url, wrong_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_user(self):
        response = self.client.post(
            self.register_url, self.user_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(
            self.login_url,
            {
                "email": self.user_data["email"],
                "password": self.user_data["password"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("access_token" in response.cookies)
        self.assertTrue("refresh_token" in response.cookies)
        response = self.client.post(
            self.login_url,
            {"email": self.user_data["email"], "password": "wrong_password"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_token(self):
        response = self.client.post(
            self.register_url, self.user_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(
            self.login_url,
            {
                "email": self.user_data["email"],
                "password": self.user_data["password"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("access_token" in response.cookies)
        self.assertTrue("refresh_token" in response.cookies)
        response = self.client.get(self.verify_token_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user(self):
        response = self.client.post(
            self.register_url, self.user_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(
            self.login_url,
            {
                "email": self.user_data["email"],
                "password": self.user_data["password"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("access_token" in response.cookies)
        self.assertTrue("refresh_token" in response.cookies)
        response = self.client.get(self.user_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user_data["email"])
        self.assertEqual(
            response.data["first_name"], self.user_data["first_name"]
        )
        self.assertEqual(
            response.data["last_name"], self.user_data["last_name"]
        )
        self.assertEqual(response.data["country"], self.user_data["country"])
        self.assertEqual(
            response.data["birth_date"], self.user_data["birth_date"]
        )

    def test_refresh_token(self):
        response = self.client.post(
            self.register_url, self.user_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(
            self.login_url,
            {
                "email": self.user_data["email"],
                "password": self.user_data["password"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("access_token" in response.cookies)
        self.assertTrue("refresh_token" in response.cookies)
        self.client.cookies.pop("access_token")
        response = self.client.post(self.refresh_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("access_token" in response.cookies)
        self.assertTrue("refresh_token" in self.client.cookies)
