# Generated by Django 4.0.5 on 2022-08-08 08:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscriptionplan',
            name='can_create_rooms',
            field=models.BooleanField(default=False),
        ),
    ]
