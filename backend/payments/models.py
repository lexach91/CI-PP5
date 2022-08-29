from django.db import models
from subscriptions.models import SubscriptionPlan, Membership
from profiles.models import User


class Payment(models.Model):
    membership = models.ForeignKey(
        Membership, on_delete=models.CASCADE, related_name="payments"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )

    def __str__(self):
        return str(self.amount) + " on " + str(self.created_at.date())


class PaymentHistory(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="payment_history"
    )
    payments = models.ManyToManyField(Payment, related_name="payment_history")

    def __str__(self):
        return self.user.email
