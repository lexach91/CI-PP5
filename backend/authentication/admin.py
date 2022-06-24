from django.contrib import admin
from .models import UserToken
# Register your models here.


@admin.register(UserToken)
class UserTokenAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'token', 'created_at', 'expired_at')
    list_filter = ('user_id', 'token', 'created_at', 'expired_at')
    search_fields = ('user_id', 'token', 'created_at', 'expired_at')
    ordering = ('user_id', 'token', 'created_at', 'expired_at')
    readonly_fields = ('user_id', 'token', 'created_at', 'expired_at')
    fields = ('user_id', 'token', 'created_at', 'expired_at')
    filter_horizontal = ()
    list_per_page = 25