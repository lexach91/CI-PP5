from django.db import models


class ForgotPasswordToken(models.Model):
    email = models.EmailField()
    token = models.CharField(max_length=255)
