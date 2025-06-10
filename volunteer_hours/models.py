from django.db import models
from django.core.exceptions import ValidationError
from accounts.models import User
from opportunities.models import Opportunity

class VolunteerHour(models.Model):
    volunteer = models.ForeignKey(User, on_delete=models.CASCADE)
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    hours_volunteered = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='verified_hours'
    )
    notes = models.TextField(blank=True)

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("End time must be after start time")

    def save(self, *args, **kwargs):
        if not self.hours_volunteered:
            time_diff = self.end_time - self.start_time
            self.hours_volunteered = time_diff.total_seconds() / 3600
        super().save(*args, **kwargs)