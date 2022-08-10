from django.db import models
from profiles.models import User
from django.conf import settings
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    guest_limit = models.IntegerField(default=0)
    can_create_rooms = models.BooleanField(default=False)
    stripe_plan_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # get stripe plan id from stripe or create new one
        if not self.stripe_plan_id and self.price > 0:
            stripe_plan = stripe.Plan.create(
                amount=int(self.price * 100),
                interval='month',
                product={
                    'name': self.name,    
                },
                currency='usd',
                # id=self.name
            )
            self.stripe_plan_id = stripe_plan.id
        elif self.price > 0:
            stripe_plan = stripe.Plan.retrieve(self.stripe_plan_id)
            # check if price has changed
            if self.price != stripe_plan.amount / 100:
                stripe.Plan.delete(self.stripe_plan_id)
                new_stripe_plan = stripe.Plan.create(
                    amount=int(self.price * 100),
                    interval='month',
                    product=stripe_plan.product,
                    currency='usd',
                    # id=self.name
                )
                self.stripe_plan_id = new_stripe_plan.id
                    
            
        super().save(*args, **kwargs)

class Membership(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='membership')
    is_active = models.BooleanField(default=True)
    type = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='memberships', default=SubscriptionPlan.objects.get(id=1).id)
    opened_at = models.DateTimeField(auto_now_add=True)
    renewed_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    stripe_id = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return self.user.email
