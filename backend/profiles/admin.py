from django.contrib import admin
from .models import User

@admin.register(User)
class AdminUser(admin.ModelAdmin):
    list_display = ('id', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'is_active', 'date_joined', 'avatar')
    # list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    # search_fields = ('email', 'first_name', 'last_name')
    # readonly_fields = ('id', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'is_active', 'date_joined')
    # fieldsets = (
    #     (None, {'fields': ('email', 'password')}),
    #     ('Personal info', {'fields': ('first_name', 'last_name')}),
    #     ('Permissions', {'fields': ('is_staff', 'is_superuser', 'is_active')}),
    # )
    # add_fieldsets = (
    #     (None, {
    #         'classes': ('wide',),
    #         'fields': ('email', 'password1', 'password2')}
    #     ),
    # )
    # ordering = ('id',)