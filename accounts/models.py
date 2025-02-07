
from django.db import models
from django.contrib.auth.models import AbstractUser

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
