import random, string
from django.db import models
from profiles.models import User


def create_room_token():
    code = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    if VideoRoom.objects.filter(token=code).exists():
        return create_room_token()
    return code


class VideoRoom(models.Model):
    token = models.CharField(max_length=32, default=create_room_token)
    host = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hosting_room')
    max_guests = models.IntegerField(default=5)
    guests = models.ManyToManyField(User, related_name='current_rooms')
    screen_sharing_enabled = models.BooleanField(default=False)
    presentation_enabled = models.BooleanField(default=False)
    chat_enabled = models.BooleanField(default=False)
    protected = models.BooleanField(default=False)
    guests_input_control = models.BooleanField(default=False)
    
    def __str__(self):
        return self.host.first_name + ' ' + self.host.last_name + ' - ' + self.id
    
    def is_full(self):
        return self.guests.count() >= self.max_guests
    
    def is_empty(self):
        return self.guests.count() == 0
    
    def is_host(self, user):
        return self.host == user
    
    def is_guest(self, user):
        return self.guests.filter(id=user.id).exists()



class VideoRoomMessage(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    room = models.ForeignKey(VideoRoom, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    