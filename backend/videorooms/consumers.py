import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import VideoRoom, VideoRoomMessage
from .serializers import VideoRoomSerializer, VideoRoomMessageSerializer
from authentication.authentication import JWTAuthentication
from profiles.models import User


class VideoRoomConsumer(AsyncWebsocketConsumer):
    """
    Consumer for video rooms
    """
    
    async def connect(self):
        """Connect to group websocket"""
        print('connect')
        # print request
        print(self.scope)
        self.user = self.scope['user']
        self.room_token = self.scope['url_route']['kwargs']['room_token']
        self.room = await self.get_room()
        print(self.room_token)
        self.room_name = 'video_room_{}'.format(self.room_token)
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )
        await self.accept()
        
    @database_sync_to_async
    def get_room(self):
        """Get room by token"""
        room = VideoRoom.objects.get(token=self.room_token)
        print(room)
        return room
    
    
    async def disconnect(self, close_code):
        """Disconnect from group websocket"""
        await self.channel_layer.group_discard(
            self.room_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Receive message from client"""
        text_data_json = json.loads(text_data)
        print(text_data_json)
        print(self.user)
        print(self.room)
        await self.send_message(text_data_json)
        
    async def send_message(self, message):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        """Send message to client"""
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))