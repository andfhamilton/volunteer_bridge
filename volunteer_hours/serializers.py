from rest_framework import serializers
from .models import VolunteerHour

class VolunteerHourSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerHour
        fields = '__all__'
        read_only_fields = ('hours_volunteered', 'verified', 'verified_by', 'volunteer')

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        return data
