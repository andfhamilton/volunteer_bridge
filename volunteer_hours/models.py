from django.db import models

class VolunteerHour(models.Model):
    volunteer = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    opportunity = models.ForeignKey('opportunities.Opportunity', on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    hours_volunteered = models.DecimalField(max_digits=5, decimal_places=2)
    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='verified_hours')
    notes = models.TextField(blank=True)
