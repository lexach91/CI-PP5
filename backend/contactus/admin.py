from django.contrib import admin
from .models import ContactUs, NewsletterSubscription

# Register your models here.


@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "message")
    list_filter = ("name", "email", "subject", "message")
    search_fields = ("name", "email", "subject", "message")


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("email",)
    list_filter = ("email",)
    search_fields = ("email",)
