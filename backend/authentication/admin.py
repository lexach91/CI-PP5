from django.contrib import admin
from .models import ForgotPasswordToken

# Register your models here.


@admin.register(ForgotPasswordToken)
class ForgotPasswordTokenAdmin(admin.ModelAdmin):
    list_display = ("email", "token")
    list_filter = ("email",)
    search_fields = ("email",)
