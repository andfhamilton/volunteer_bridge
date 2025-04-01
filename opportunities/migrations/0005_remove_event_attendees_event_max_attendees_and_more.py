# Generated by Django 4.2.18 on 2025-04-01 21:17

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('opportunities', '0004_event'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='event',
            name='attendees',
        ),
        migrations.AddField(
            model_name='event',
            name='max_attendees',
            field=models.PositiveIntegerField(default=50),
        ),
        migrations.AddField(
            model_name='event',
            name='waitlist_enabled',
            field=models.BooleanField(default=True),
        ),
        migrations.CreateModel(
            name='RSVP',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('REGISTERED', 'Registered'), ('ATTENDING', 'Attending'), ('WAITLISTED', 'Waitlisted'), ('CANCELLED', 'Cancelled')], default='REGISTERED', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='opportunities.event')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'event')},
            },
        ),
    ]
