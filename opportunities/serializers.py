from rest_framework import serializers
from django.utils.dateparse import parse_datetime
from .models import Opportunity, Event, RSVP
from django.utils import timezone
from accounts.serializers import UserSerializer

class OpportunitySerializer(serializers.ModelSerializer):
    category_display = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()
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
    def get_category_display(self, obj):
        return obj.get_category_display()
        
    def get_organization_name(self, obj):
        return obj.organization.username if obj.organization else None

class MatchResultSerializer(serializers.Serializer):
    volunteer = UserSerializer()
    match_score = serializers.IntegerField()

class EventSerializer(serializers.ModelSerializer):
    available_slots = serializers.SerializerMethodField()
    attendee_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')
    
    def get_available_slots(self, obj):
        return obj.max_attendees - obj.rsvps.filter(status='ATTENDING').count()
        
    def get_attendee_count(self, obj):
        return obj.rsvps.filter(status='ATTENDING').count()

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        return data

class RSVPSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSVP
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def validate(self, data):
        event = data['event']
        if event.start_time < timezone.now():
            raise serializers.ValidationError("Cannot RSVP for past events")
        return data