import random
import string
from django.db import models
from profiles.models import User


def create_room_token():
    code = "".join(random.choices(string.ascii_letters + string.digits, k=32))
    if VideoRoom.objects.filter(token=code).exists():
        return create_room_token()
    return code


class VideoRoom(models.Model):
    token = models.CharField(max_length=32, default=create_room_token)
    host = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="hosting_room"
    )
    max_guests = models.IntegerField(default=3)
    guests = models.ManyToManyField(
        User, related_name="current_rooms", blank=True
    )
    screen_sharing_enabled = models.BooleanField(default=False)
    presentation_enabled = models.BooleanField(default=False)
    chat_enabled = models.BooleanField(default=False)
    protected = models.BooleanField(default=False)
    guests_input_control = models.BooleanField(default=False)
    password = models.CharField(
        max_length=32, default="", blank=True, null=True
    )
    guests_muted = models.BooleanField(default=False)

    def __str__(self):
        return f"VideoRoom {self.token}, host: {self.host}"

    def is_full(self):
        return self.guests.count() >= self.max_guests

    def is_empty(self):
        return self.guests.count() == 0

    def is_host(self, user):
        return self.host == user

    def is_guest(self, user):
        return self.guests.filter(id=user.id).exists()

    def check_password(self, password):
        return self.password == password
