# Generated by Django 4.0.5 on 2022-08-10 06:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0003_payment_amount'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='payment',
            name='is_canceled',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='is_complete',
        ),
    ]