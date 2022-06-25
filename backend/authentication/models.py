from django.db import models

# Create your models here.

class UserToken(models.Model):
    user_id = models.IntegerField()
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expired_at = models.DateTimeField()


class ForgotPasswordToken(models.Model):
    email = models.EmailField()
    token = models.CharField(max_length=255)
