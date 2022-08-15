import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import VideoRoom, VideoRoomMessage
from .serializers import VideoRoomSerializer, VideoRoomMessageSerializer
from authentication.authentication import JWTAuthentication
from profiles.models import User
from authentication.serializers import UserSerializer
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
    
    connected_peers = {}
    muted_peers = []
    muted_all = False
    
    async def connect(self):
        """Connect to group websocket"""
        self.room_token = self.scope['url_route']['kwargs']['room_token']
        self.room_group_name = 'videoroom_%s' % self.room_token
        self.user = await self.get_user()
        self.room = await self.get_room()
        self.is_host = self.user['id'] == self.room['host']
        
        
        if self.user is None or self.room is None:            
            await self.close()
            return
            
        if not self.is_host and not self.user['id'] in self.room['guests']:
            await self.close()
            return
        
        
        # print(self.room, 'ROOOOM')
        # print(self.user, 'USER')
        # print(self.is_host)
        
        # if self.user not in self.room.guests.all() and self.user != self.room.host:
        #     await self.close()
        #     return
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # self.connected_peers[self.user['id']] = self.channel_name
        if not self.user['id'] in self.connected_peers:
            self.connected_peers[self.user['id']] = self.channel_name
        # print('Connected to group %s' % self.room_group_name)
        # # print the request
        # print(self.scope)
        # print(self.user)
        
        await self.accept()
        
        if self.muted_all:
            self.muted_peers.append(self.user['id'])
        
        # send room details to client
        await self.send(text_data=json.dumps({
            'type': 'room_details',
            'action': 'joined',
            'room': self.room,
            'connected_peers': self.connected_peers,
            'is_host': self.is_host,
            'muted_all': self.muted_all,
            'muted_peers': self.muted_peers,
        }))
        print('Connected peers:', self.connected_peers)
        print('Muted peers:', self.muted_peers)
        print('Muted all:', self.muted_all)        
        
        # send all messages to client
        # messages = await self.get_messages()
        # for message in messages:
        #     await self.send(text_data=json.dumps({
        #         'type': 'message',
        #         'message': VideoRoomMessageSerializer(message).data,
        #     }))
        
    
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        action = data['action']
        # print(data)
        
        if action == 'mute-all':
            print('Muting all')
            self.muted_all = True
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_sdp',
                    'data': {
                        'peer': self.user['id'],
                        'action': 'mute-all',
                    }
                }
            )
            print('Connected peers:', self.connected_peers)
            print('Muted peers:', self.muted_peers)
            print('Muted all:', self.muted_all)
            return
        
        if action == 'unmute-all':
            self.muted_all = False
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_sdp',
                    'data': {
                        'peer': self.user['id'],
                        'action': 'unmute-all',
                    }
                }
            )
            print('Connected peers:', self.connected_peers)
            print('Muted peers:', self.muted_peers)
            print('Muted all:', self.muted_all)
            return
        
        if action == 'mute-peer':
            if message['peer'] not in self.muted_peers:
                self.muted_peers.append(message['peer'])
            print('Connected peers:', self.connected_peers)
            print('Muted peers:', self.muted_peers)
            print('Muted all:', self.muted_all)
            
        if action == 'unmute-peer':
            if message['peer'] in self.muted_peers:
                self.muted_peers.remove(message['peer'])
            print('Connected peers:', self.connected_peers)
            print('Muted peers:', self.muted_peers)
            print('Muted all:', self.muted_all)
        
        if action == 'room-deleted':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_sdp',
                    'data': {
                        'peer': self.user['id'],
                        'action': 'room-deleted',
                    }
                }
            )
            self.connected_peers.clear()
            self.muted_all = False
            self.muted_peers.clear()
            return
        
        if action == 'new-offer' or action == 'new-answer':
            receiver_channel_name = data['message']['receiver_channel_name']
            
            data['message']['receiver_channel_name'] = self.channel_name
            
            await self.channel_layer.send(
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
        
        # this_peer = data['peer']
        # action = data['action']
        # message = data['message']
        
        await self.send(text_data=json.dumps(data))
            #     {
            #     'peer': this_peer,
            #     'action': action,
            #     'message': message
            # }))
        
            
    async def disconnect(self, close_code):
        self.connected_peers.pop(self.user['id'], None)        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_sdp',
                'data': {
                    'peer': self.user['id'],
                    'action': 'disconnected',
                    'message': {
                        'receiver_channel_name': self.channel_name,
                    }
                }
            }
        )
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print('Connected peers:', self.connected_peers)
        

    @database_sync_to_async
    def get_user(self):
        user = JWTAuthentication.websocket_authenticate(self.scope)
        user_serializer = UserSerializer(user)
        return user_serializer.data if user else None
    
    @database_sync_to_async
    def get_room(self):
        room = VideoRoom.objects.get(token=self.room_token)
        room_serializer = VideoRoomSerializer(room)
        return room_serializer.data if room else None
