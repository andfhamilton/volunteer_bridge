
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.conf import settings

class User(AbstractUser):
    is_volunteer = models.BooleanField(default=False)
    is_organization = models.BooleanField(default=False)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    skills = models.JSONField(null=True, blank=True)
    interests = models.JSONField(null=True, blank=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.is_volunteer and self.is_organization:
            raise ValidationError("User cannot be both volunteer and organization")
        
class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    subject = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

class Application(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    
    volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    opportunity = models.ForeignKey('opportunities.Opportunity', on_delete=models.CASCADE, related_name='applications')
    note = models.TextField(blank=True, help_text="Volunteer's note about why they want to apply")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('volunteer', 'opportunity')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.volunteer.username}'s application for {self.opportunity.title}"