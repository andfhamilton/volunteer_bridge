from django.db import models
from django.conf import settings

class Opportunity(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('FILLED', 'Filled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled')
    ]
    CATEGORY_CHOICES = [
        ('EDU', 'Education'),
        ('ENV', 'Environment'),
        ('HEA', 'Health'),
        ('ANI', 'Animals'),
        ('ART', 'Arts'),
        ('COM', 'Community Development'),
        ('DRE', 'Disaster Relief'),
        ('HUM', 'Human Rights'),
        ('OTH', 'Other')
    ]
    category = models.CharField(max_length=3, choices=CATEGORY_CHOICES, default='COM')
    
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
    commitment_hours = models.IntegerField(null=True, blank=True, help_text="Hours per week")
    virtual = models.BooleanField(default=False)

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=200)
    opportunity = models.ForeignKey('Opportunity', on_delete=models.CASCADE, null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    max_attendees = models.PositiveIntegerField(default=50)
    waitlist_enabled = models.BooleanField(default=True)

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return self.title

class RSVP(models.Model):
    RSVP_STATUS = [
        ('REGISTERED', 'Registered'),
        ('ATTENDING', 'Attending'),
        ('WAITLISTED', 'Waitlisted'),
        ('CANCELLED', 'Cancelled')
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='rsvps')
    status = models.CharField(max_length=10, choices=RSVP_STATUS, default='REGISTERED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'event')
