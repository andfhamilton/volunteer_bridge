from rest_framework import serializers
from django.utils.dateparse import parse_datetime
from .models import Opportunity, Event
from accounts.serializers import UserSerializer

class OpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = '__all__'
        read_only_fields = ('created_at', 'organization')

    def validate(self, data):
        if isinstance(data.get('start_date'), str):
            data['start_date'] = parse_datetime(data['start_date'])
        if isinstance(data.get('end_date'), str):
            data['end_date'] = parse_datetime(data['end_date'])
            
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data

class MatchResultSerializer(serializers.Serializer):
    volunteer = UserSerializer()
    match_score = serializers.IntegerField()

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        return data
