# Generated by Django 4.0.5 on 2022-08-28 06:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_forgotpasswordtoken'),
    ]

    operations = [
        migrations.DeleteModel(
            name='UserToken',
        ),
    ]
