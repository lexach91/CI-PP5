from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from authentication.authentication import JWTAuthentication
from .serializers import EditProfileSerializer


class EditProfileAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response(
                {"error": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        new_data = request.data
        serializer = EditProfileSerializer(user, data=new_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user_data = serializer.data
            if user.avatar:
                user_data['avatar'] = user.avatar.url
            return Response(
                {
                    "success": "Profile updated",
                    "user": user_data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditDevicesSettingsAPIView(APIView):
    """Allows a user to save default camera and microphone"""

    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response(
                {"error": "You are not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        new_data = request.data
        user.camera_id = new_data.get("camera_id", None)
        user.microphone_id = new_data.get("microphone_id", None)
        user.save()
        return Response(
            {"success": "Devices settings updated"}, status=status.HTTP_200_OK
        )
