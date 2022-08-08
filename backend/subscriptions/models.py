from django.db import models
from profiles.models import User


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    guest_limit = models.IntegerField(default=0)
    can_create_rooms = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    

class Membership(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='membership')
    is_active = models.BooleanField(default=True)
    type = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='memberships')
    opened_at = models.DateTimeField(auto_now_add=True)
    renewed_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.user.email
