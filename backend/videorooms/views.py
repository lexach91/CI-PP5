from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import VideoRoomSerializer
from authentication.authentication import JWTAuthentication
from .models import VideoRoom


class CreateRoomAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        if user is None:
            return Response(
                {'error': 'You are not logged in'},
                status=status.HTTP_401_UNAUTHORIZED
                )
        if VideoRoom.objects.filter(host=user).exists():
            return Response(
                {'error': 'You already have a room'},
                status=status.HTTP_400_BAD_REQUEST
                )
        serializer = VideoRoomSerializer(data=request.data)
        # insert the user as the host of the room
        serializer.initial_data['host'] = user.id

        if serializer.is_valid():
            serializer.save(host=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JoinRoomAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        room_token = request.data['room_token']
        if user is None:
            return Response(
                {'error': 'You are not logged in'},
                status=status.HTTP_401_UNAUTHORIZED
                )
        # check if room exists
        if not VideoRoom.objects.filter(token=room_token).exists():
            return Response(
                {'error': 'Room does not exist'},
                status=status.HTTP_400_BAD_REQUEST
                )

        room = VideoRoom.objects.get(token=room_token)

        if room.host == user:
            return Response(
                {'error': 'You cannot join your own room'},
                status=status.HTTP_400_BAD_REQUEST
                )

        if room.guests.filter(id=user.id).exists():
            return Response(
                {'error': 'You are already in this room'},
                status=status.HTTP_400_BAD_REQUEST
                )

        if room.guests.count() >= room.max_guests:
            return Response(
                {'error': 'Room is full'},
                status=status.HTTP_400_BAD_REQUEST
                )

        if room.protected:
            if 'password' not in request.data:
                return Response(
                    {'error': 'Room is protected'},
                    status=status.HTTP_400_BAD_REQUEST
                    )
            if not room.check_password(request.data['password']):
                return Response(
                    {'error': 'Wrong password'},
                    status=status.HTTP_400_BAD_REQUEST
                    )

        room.guests.add(user)
        return Response(
            {'success': 'You have joined the room'},
            status=status.HTTP_200_OK
            )


class CheckRoomProtectedAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        room_token = request.query_params['room_token']

        if user is None:
            return Response(
                {'error': 'You are not logged in'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        if room_token is None:
            return Response(
                {'error': 'No room token provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not VideoRoom.objects.filter(token=room_token).exists():
            return Response(
                {'error': 'Room does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        room = VideoRoom.objects.get(token=room_token)
        return Response(
            {'protected': room.protected},
            status=status.HTTP_200_OK
        )


class LeaveRoomAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        room_token = request.data['room_token']
        if user is None:
            return Response(
                {'error': 'You are not logged in'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        if room_token is None:
            return Response(
                {'error': 'No room token provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # check if room exists
        if not VideoRoom.objects.filter(token=room_token).exists():
            return Response(
                {'error': 'Room does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        room = VideoRoom.objects.get(token=room_token)

        if room.host == user:
            room.delete()
            return Response(
                {'success': 'You have left the room'},
                status=status.HTTP_200_OK
            )

        if not room.guests.filter(id=user.id).exists():
            return Response(
                {'error': 'You are not in this room'},
                status=status.HTTP_400_BAD_REQUEST
            )

        room.guests.remove(user)
        return Response(
            {'success': 'You have left the room'},
            status=status.HTTP_200_OK
        )


class DeleteRoomAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        room_token = request.data['room_token']
        if user is None:
            return Response(
                {'error': 'You are not logged in'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        # check if room exists
        if not VideoRoom.objects.filter(token=room_token).exists():
            return Response(
                {'error': 'Room does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )

        room = VideoRoom.objects.get(token=room_token)

        if room.host == user:
            room.delete()
            return Response(
                {'success': 'Room deleted'},
                status=status.HTTP_200_OK
            )
        return Response(
            {'error': 'You cannot delete other users rooms'},
            status=status.HTTP_400_BAD_REQUEST
        )


class SetPasswordAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        room_token = request.data['room_token']
        password = request.data['password']
        if user is None:
            return Response(
                {'error': 'You are not logged in'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        # check if room exists
        if not VideoRoom.objects.filter(token=room_token).exists():
            return Response(
                {'error': 'Room does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )

        room = VideoRoom.objects.get(token=room_token)

        if room.host != user:
            return Response(
                {'error': 'You cannot set password for other users rooms'},
                status=status.HTTP_400_BAD_REQUEST
            )

        room.set_password(password)
        return Response(
            {'success': 'Password set'},
            status=status.HTTP_200_OK
        )


class ResetPasswordAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        room_token = request.data['room_token']
        if user is None:
            return Response(
                {'error': 'You are not logged in'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        # check if room exists
        if not VideoRoom.objects.filter(token=room_token).exists():
            return Response(
                {'error': 'Room does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )

        room = VideoRoom.objects.get(token=room_token)

        if room.host != user:
            return Response(
                {'error': 'You cannot reset password for other users rooms'},
                status=status.HTTP_400_BAD_REQUEST
            )

        room.reset_password()
        return Response(
            {'success': 'Password reset'},
            status=status.HTTP_200_OK
        )


class CheckUserInRoomAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user

        if user is None:
            return Response(
                {'error': 'You are not logged in'},
                status=status.HTTP_401_UNAUTHORIZED
                )

        user_host = VideoRoom.objects.filter(host=user).exists()

        if user_host:
            room = VideoRoom.objects.get(host=user)
            return Response(
                {'host': True, 'room_token': room.token},
                status=status.HTTP_200_OK
                )

        user_guest = VideoRoom.objects.filter(guests__in=[user]).exists()

        if user_guest:
            room = VideoRoom.objects.get(guests__in=[user])
            return Response(
                {'host': False, 'room_token': room.token},
                status=status.HTTP_200_OK
                )

        return Response(
            {'host': False, 'room_token': None},
            status=status.HTTP_200_OK
            )


class GetRoomAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        room_token = request.query_params['room_token']

        if user is None:
            return Response(
                {'error': 'You are not logged in'},
                status=status.HTTP_401_UNAUTHORIZED
                )

        if not VideoRoom.objects.filter(token=room_token).exists():
            return Response(
                {'error': 'Room does not exist'},
                status=status.HTTP_400_BAD_REQUEST
                )

        room = VideoRoom.objects.get(token=room_token)

        if room.host != user and not room.guests.filter(id=user.id).exists():
            return Response(
                {'error': 'You are not in this room'},
                status=status.HTTP_400_BAD_REQUEST
                )

        serializer = VideoRoomSerializer(room)

        data = serializer.data

        if room.host == user:
            data['is_host'] = True

        return Response(data, status=status.HTTP_200_OK)
