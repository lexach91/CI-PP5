from django.urls import path
from .views import (
    CreateRoomAPIView,
    JoinRoomAPIView,
    LeaveRoomAPIView,
    DeleteRoomAPIView,
    SetPasswordAPIView,
    ResetPasswordAPIView,
    CheckUserInRoomAPIView,
    GetRoomAPIView,
    CheckRoomProtectedAPIView,
)

urlpatterns = [
    path("create", CreateRoomAPIView.as_view(), name="create"),
    path("join", JoinRoomAPIView.as_view(), name="join"),
    path("leave", LeaveRoomAPIView.as_view(), name="leave"),
    path("delete", DeleteRoomAPIView.as_view(), name="delete"),
    path("set-password", SetPasswordAPIView.as_view(), name="set-room-password"),
    path(
        "reset-password", ResetPasswordAPIView.as_view(), name="reset-room-password"
    ),
    path(
        "check-user-in-room",
        CheckUserInRoomAPIView.as_view(),
        name="check-user-in-room",
    ),
    path("get", GetRoomAPIView.as_view(), name="get"),
    path(
        "is-protected",
        CheckRoomProtectedAPIView.as_view(),
        name="is-protected",
    ),
]
