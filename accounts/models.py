from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    is_volunteer = models.BooleanField(default=False)
    is_organization = models.BooleanField(default=False)
    skills = models.JSONField(null=True, blank=True)
    interests = models.JSONField(null=True, blank=True)
