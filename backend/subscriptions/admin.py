from django.contrib import admin
from .models import SubscriptionPlan, Membership


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "can_create_rooms",
        "price",
        "guest_limit",
        "description",
        "created_at",
        "updated_at",
    )


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "is_active",
        "type",
        "opened_at",
        "renewed_at",
        "expires_at",
    )
