from rest_framework.serializers import ModelSerializer
from .models import User


class EditProfileSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = [
            "country",
            "avatar",
            "first_name",
            "last_name",
            "birth_date",
        ]
