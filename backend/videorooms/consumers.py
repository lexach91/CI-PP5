import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import VideoRoom, VideoRoomMessage
from .serializers import VideoRoomSerializer, VideoRoomMessageSerializer
from authentication.authentication import JWTAuthentication
from profiles.models import User
from channels.layers import get_channel_layer

channel_layer = get_channel_layer()


class VideoRoomConsumer(AsyncWebsocketConsumer):
    """
    Consumer for video rooms, that handles the following:
    - Connect to a video room using the token provided in the URL
    - Send SDP offer to everyone in the room
    - Receive SDP answer from everyone in the room
    - Send ICE candidates to everyone in the room
    - Receive ICE candidates from everyone in the room
    - Send video room messages to everyone in the room
    - Receive video room messages from everyone in the room
    """
    
    async def connect(self):
        """Connect to group websocket"""
        self.room_token = self.scope['url_route']['kwargs']['room_token']
        self.room_group_name = 'videoroom_%s' % self.room_token
        self.user = await self.get_user()
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        print('Connected to group %s' % self.room_group_name)
        # print the request
        print(self.scope)
        print(self.user)
        
        await self.accept()
        
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        user_id = data['user_id']
        action = data['action']
        message = data['message']
        
        if action == 'sdp_offer' or action == 'sdp_answer':
            receiver_channel_name = data['message']['receiver_channel_name']
            
            data['message']['receiver_channel_name'] = self.channel_name
            
            await self.channel_layer.group_send(
                receiver_channel_name,
                {
                    'type': 'send_sdp',
                    'data': data
                }
            )
            
            return
        
        data['message']['receiver_channel_name'] = self.channel_name
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_sdp',
                'data': data
            }
        )
        
    async def send_sdp(self, event):
        data = event['data']
        
        this_peer = data['peer']
        action = data['action']
        message = data['message']
        
        await self.send(text_data=json.dumps({
            'peer': this_peer,
            'action': action,
            'message': message
        }))

    @database_sync_to_async
    def get_user(self):
        user = JWTAuthentication.websocket_authenticate(self.scope)
        return user