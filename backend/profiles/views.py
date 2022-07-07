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
            return Response({'error': 'You are not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
        new_data = request.data
        serializer = EditProfileSerializer(user, data=new_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': 'Profile updated'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)