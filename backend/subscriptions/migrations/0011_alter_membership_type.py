# Generated by Django 4.0.5 on 2022-12-22 08:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0010_alter_membership_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='membership',
            name='type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='memberships', to='subscriptions.subscriptionplan'),
        ),
    ]
