from django.contrib import admin
from .models import UserToken, ForgotPasswordToken
# Register your models here.


@admin.register(UserToken)
class UserTokenAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'token', 'created_at', 'expired_at')
    list_filter = ('user_id', 'created_at', 'expired_at')
    search_fields = ('user_id', 'created_at', 'expired_at')
    ordering = ('user_id', 'created_at', 'expired_at')
    readonly_fields = ('user_id', 'token', 'created_at', 'expired_at')
    
    

@admin.register(ForgotPasswordToken)
class ForgotPasswordTokenAdmin(admin.ModelAdmin):
    list_display = ('email', 'token')
    list_filter = ('email',)
    search_fields = ('email',)
    