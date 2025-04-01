from rest_framework import viewsets, permissions, status
from django.db.models import Q
from rest_framework.response import Response
from .models import Opportunity, Event, RSVP
from rest_framework.decorators import action
from .serializers import OpportunitySerializer, EventSerializer, RSVPSerializer
from rest_framework.exceptions import ValidationError
from accounts.permissions import IsOrganization
from .matching import match_volunteers_to_opportunities

class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsOrganization]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(organization=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['GET'])
    def matches(self, request, pk=None):
        """Get matching volunteers for this opportunity"""
        opportunity = self.get_object()
        if not request.user.is_organization:
            return Response(
                {"detail": "Only organizations can view matches"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        matches = match_volunteers_to_opportunities(opportunity)
        return Response(matches)
    
class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['POST'])
    def attend(self, request, pk=None):
        event = self.get_object()
        RSVP.objects.create(user=request.user, event=event, status='ATTENDING')
        return Response({'status': 'registered for event'})
    @action(detail=True, methods=['POST'])
    def rsvp(self, request, pk=None):
        event = self.get_object()
    
        # Check current attendance count
        attendee_count = event.rsvps.filter(status='ATTENDING').count()
        
        # Determine status based on capacity
        if attendee_count < event.max_attendees:
            status_value = 'ATTENDING'
        elif event.waitlist_enabled:
            status_value = 'WAITLISTED'
        else:
            return Response({'error': 'Event is full and waitlist is disabled'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        # Create RSVP with appropriate status
        rsvp = RSVP.objects.create(
            user=request.user, 
            event=event, 
            status=status_value
        )
        
        serializer = RSVPSerializer(rsvp)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RSVPViewSet(viewsets.ModelViewSet):
    serializer_class = RSVPSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RSVP.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        event = serializer.validated_data['event']
        
        if RSVP.objects.filter(user=self.request.user, event=event).exists():
            raise ValidationError("You already have an RSVP for this event")
            
        if event.rsvps.filter(status='ATTENDING').count() >= event.max_attendees:
            if event.waitlist_enabled:
                serializer.save(user=self.request.user, status='WAITLISTED')
            else:
                raise ValidationError("Event is full")
        else:
            serializer.save(user=self.request.user)