import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import VideoRoom
from .serializers import VideoRoomSerializer
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

    async def connect(self):
        """Connect to group websocket"""
        self.room_token = self.scope["url_route"]["kwargs"]["room_token"]
        self.room_group_name = "videoroom_%s" % self.room_token
        self.user = await self.get_user()
        self.room = await self.get_room()
        self.is_host = self.user["id"] == self.room["host"]

        if self.user is None or self.room is None:
            await self.close()
            return

        if not self.is_host and not self.user["id"] in self.room["guests"]:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )

        if not self.user["id"] in self.connected_peers:
            self.connected_peers[self.user["id"]] = self.channel_name

        await self.accept()

        if (
            self.room["guests_muted"] and not
            self.user["id"] in self.muted_peers
        ):
            self.muted_peers.append(self.user["id"])

        # send room details to client
        await self.send(
            text_data=json.dumps(
                {
                    "type": "room_details",
                    "action": "joined",
                    "room": self.room,
                    "connected_peers": self.connected_peers,
                    "is_host": self.is_host,
                    "muted_all": self.room["guests_muted"],
                    "muted_peers": self.muted_peers,
                }
            )
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data["message"]
        action = data["action"]

        if action == "mute-all":
            await self.mute_all()
            self.room = await self.get_room()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "send_sdp",
                    "data": {
                        "peer": self.user["id"],
                        "action": "mute-all",
                    },
                },
            )
            return

        if action == "unmute-all":
            await self.unmute_all()
            self.room = await self.get_room()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "send_sdp",
                    "data": {
                        "peer": self.user["id"],
                        "action": "unmute-all",
                    },
                },
            )
            return

        if action == "mute-peer":
            if message["peer"] not in self.muted_peers:
                self.muted_peers.append(message["peer"])

        if action == "unmute-peer":
            if message["peer"] in self.muted_peers:
                self.muted_peers.remove(message["peer"])

        if action == "room-deleted":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "send_sdp",
                    "data": {
                        "peer": self.user["id"],
                        "action": "room-deleted",
                    },
                },
            )
            self.connected_peers.clear()
            self.muted_peers.clear()
            return

        if action == "new-offer" or action == "new-answer":
            receiver_channel_name = data["message"]["receiver_channel_name"]

            data["message"]["receiver_channel_name"] = self.channel_name

            await self.channel_layer.send(
                receiver_channel_name, {"type": "send_sdp", "data": data}
            )
            return

        data["message"]["receiver_channel_name"] = self.channel_name

        await self.channel_layer.group_send(
            self.room_group_name, {"type": "send_sdp", "data": data}
        )

    async def send_sdp(self, event):
        data = event["data"]

        await self.send(text_data=json.dumps(data))

    async def disconnect(self, close_code):
        self.connected_peers.pop(self.user["id"], None)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "send_sdp",
                "data": {
                    "peer": self.user["id"],
                    "action": "disconnected",
                    "message": {
                        "receiver_channel_name": self.channel_name,
                    },
                },
            },
        )
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

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

    @database_sync_to_async
    def mute_all(self):
        room = VideoRoom.objects.get(token=self.room_token)
        room.guests_muted = True
        room.save()

    @database_sync_to_async
    def unmute_all(self):
        room = VideoRoom.objects.get(token=self.room_token)
        room.guests_muted = False
        room.save()
