from django.db import models
from accounts.models import User

class Opportunity(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('FILLED', 'Filled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled')
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    organization = models.ForeignKey('accounts.User', on_delete=models.CASCADE, limit_choices_to={'is_organization': True})
    required_skills = models.JSONField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    max_volunteers = models.IntegerField(default=1)

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=200)
    opportunity = models.ForeignKey('Opportunity', on_delete=models.CASCADE, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    attendees = models.ManyToManyField(User, related_name='events_attending', blank=True)

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return self.title

