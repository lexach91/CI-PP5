# Generated by Django 3.2 on 2022-08-07 07:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0003_alter_user_managers'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='profession',
        ),
        migrations.RemoveField(
            model_name='user',
            name='timezone',
        ),
        migrations.AddField(
            model_name='user',
            name='camera_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='microphone_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]