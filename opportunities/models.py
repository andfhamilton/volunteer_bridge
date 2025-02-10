from django.db import models

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
