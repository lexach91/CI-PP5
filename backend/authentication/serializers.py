from rest_framework.serializers import ModelSerializer
from profiles.models import User


class UserSerializer(ModelSerializer):
    """User Serializer"""

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'country',
            'birth_date',
            'password',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance