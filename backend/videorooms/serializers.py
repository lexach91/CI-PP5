from rest_framework.serializers import ModelSerializer
from .models import VideoRoom, VideoRoomMessage


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
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
        