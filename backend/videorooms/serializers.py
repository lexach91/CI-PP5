from rest_framework.serializers import ModelSerializer
from .models import VideoRoom


class VideoRoomSerializer(ModelSerializer):
    class Meta:
        model = VideoRoom
        fields = [
            'id',
            'token',
            'host',
            'max_guests',
            'guests',
            'screen_sharing_enabled',
            'presentation_enabled',
            'chat_enabled',
            'protected',
            'guests_input_control',
            'password',
            'guests_muted',
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }
