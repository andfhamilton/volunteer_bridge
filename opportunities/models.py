from django.db import models

class Opportunity(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    organization = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    required_skills = models.JSONField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
