from django.urls import re_path, path
from .consumers import VideoRoomConsumer

websocket_urlpatterns = [
    # room token is passed as a path parameter
    re_path(r'ws/videorooms/(?P<room_token>[^/]+)/$', VideoRoomConsumer.as_asgi()),
    re_path(r'ws/videorooms/(?P<room_token>\w+)/$', VideoRoomConsumer.as_asgi()),
    path('ws/videorooms/<str:room_token>/', VideoRoomConsumer.as_asgi()),
]
