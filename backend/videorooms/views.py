from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoRoomSerializer, VideoRoomMessageSerializer
from authentication.authentication import JWTAuthentication
from .models import VideoRoom, VideoRoomMessage


class CreateRoomAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        if VideoRoom.objects.filter(host=user).exists():
            return Response({'error': 'You already have a room'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = VideoRoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(host=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
