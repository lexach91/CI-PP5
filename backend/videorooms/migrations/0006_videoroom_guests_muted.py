# Generated by Django 4.0.5 on 2022-08-16 05:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('videorooms', '0005_alter_videoroom_max_guests'),
    ]

    operations = [
        migrations.AddField(
            model_name='videoroom',
            name='guests_muted',
            field=models.BooleanField(default=False),
        ),
    ]