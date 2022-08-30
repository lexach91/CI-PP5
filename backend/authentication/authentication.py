import jwt
import datetime
from rest_framework import status, exceptions
from rest_framework.response import Response
from rest_framework.authentication import BaseAuthentication
from profiles.models import User


class JWTAuthentication(BaseAuthentication):
    """Custom JWT authentication class for DRF"""

    def authenticate(self, request):

        access_token = request.COOKIES.get("access_token")

        if access_token is None:
            raise exceptions.AuthenticationFailed("No access token")

        id = decode_access_token(access_token)

        if id is None:
            raise exceptions.AuthenticationFailed("Invalid access token")

        user = User.objects.get(id=id)

        if user is None:
            raise exceptions.AuthenticationFailed("User not found")

        return (user, None)

    def websocket_authenticate(scope):
        """Authenticate websocket request"""
        access_token = scope["cookies"].get("access_token")

        if access_token is None:
            raise exceptions.AuthenticationFailed("No access token")

        id = decode_access_token(access_token)

        if id is None:
            raise exceptions.AuthenticationFailed("Invalid access token")

        user = User.objects.get(id=id)

        if user is None:
            raise exceptions.AuthenticationFailed("User not found")

        return user


def create_access_token(user_id):
    """
    Creates an access token for a user.
    """
    return jwt.encode(
        {
            "user_id": user_id,
            "exp": datetime.datetime.utcnow() +
            datetime.timedelta(seconds=600),
            "iat": datetime.datetime.utcnow(),
        },
        "access_secret",
        algorithm="HS256",
    )


def create_refresh_token(user_id):
    """
    Creates a refresh token for a user.
    """
    return jwt.encode(
        {
            "user_id": user_id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
            "iat": datetime.datetime.utcnow(),
        },
        "refresh_secret",
        algorithm="HS256",
    )


def decode_access_token(token):
    """
    Decodes an access token.
    """
    try:
        payload = jwt.decode(token, "access_secret", algorithms=["HS256"])
        return payload["user_id"]
    except:
        return None


def decode_refresh_token(token):
    """
    Decodes a refresh token.
    """
    try:
        payload = jwt.decode(token, "refresh_secret", algorithms=["HS256"])
        return payload["user_id"]
    except:
        return None
