from django.db import models
from subscriptions.models import SubscriptionPlan, Membership
from profiles.models import User


class Payment(models.Model):
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE, related_name='payments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_complete = models.BooleanField(default=False)
    is_canceled = models.BooleanField(default=False)

    def __str__(self):
        return self.membership.user.email

class PaymentHistory(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='payment_history')
    payments = models.ManyToManyField(Payment, related_name='payment_history')
    
    def __str__(self):
        return self.user.email
