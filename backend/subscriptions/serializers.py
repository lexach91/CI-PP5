from rest_framework.serializers import ModelSerializer
from .models import Membership, SubscriptionPlan


class SubscriptionPlanSerializer(ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            'name',
            'guest_limit',
            'can_create_rooms',
        ]
