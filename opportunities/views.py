from rest_framework import viewsets, permissions, status
from django.db.models import Q
from rest_framework.response import Response
from .models import Opportunity, Event, RSVP
from rest_framework.decorators import action, api_view, permission_classes
from .serializers import OpportunitySerializer, EventSerializer, RSVPSerializer
from rest_framework.exceptions import ValidationError
from accounts.permissions import IsOrganization
from rest_framework.permissions import IsAuthenticated
from .matching import match_volunteers_to_opportunities
from notifications.utils import create_notification
from django.contrib.auth import get_user_model

User = get_user_model()

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
        opportunity = serializer.save(organization=self.request.user)
        
        # Notify all volunteers about the new opportunity
        volunteers = User.objects.filter(is_volunteer=True)
        for volunteer in volunteers:
            create_notification(
                user=volunteer,
                notification_type='opportunity',
                message=f"New opportunity available: {opportunity.title}",
                related_object_id=opportunity.id
            )

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

        # Notify matched volunteers if this is the first time they're matched
        for match in matches:
            volunteer = match['volunteer']
            create_notification(
                user=volunteer,
                notification_type='opportunity',
                message=f"You've been matched to {opportunity.title} based on your skills",
                related_object_id=opportunity.id
            )
        return Response(matches)
    
class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        # Notify volunteers about new event
        volunteers = User.objects.filter(is_volunteer=True)
        for volunteer in volunteers:
            create_notification(
                user=volunteer,
                notification_type='event',
                message=f"New event scheduled: {event.title}",
                related_object_id=event.id
            )

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

        # Create notification for the user
        create_notification(
            user=request.user,
            notification_type='rsvp',
            message=f"Your RSVP for {event.title} is {status_value}",
            related_object_id=event.id
        )
        
        # Notify event creator
        create_notification(
            user=event.created_by,
            notification_type='rsvp',
            message=f"{request.user.username} has RSVP'd to your event: {event.title}",
            related_object_id=event.id
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organization_opportunities(request):
    """List opportunities created by the current organization"""
    if not request.user.is_organization:
        return Response({"detail": "Only organizations can access this endpoint"}, status=403)
    
    opportunities = Opportunity.objects.filter(organization=request.user)
    serializer = OpportunitySerializer(opportunities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_opportunities(request):
    """List opportunities recommended for the current volunteer"""
    if not request.user.is_volunteer:
        return Response({"detail": "Only volunteers can access this endpoint"}, status=403)
    
    # Get user's skills and interests
    user_skills = request.user.skills
    user_interests = request.user.interests
    
    # Find opportunities matching skills and interests
    # This is a simple implementation - you can make it more sophisticated
    if user_skills or user_interests:
        opportunities = Opportunity.objects.filter(
            Q(required_skills__overlap=user_skills) | 
            Q(category__in=user_interests)
        ).distinct()[:6]  # Limit to 6 recommendations
    else:
        # If no skills/interests, return recent opportunities
        opportunities = Opportunity.objects.filter(status='OPEN').order_by('-created_at')[:6]
    
    serializer = OpportunitySerializer(opportunities, many=True)
    return Response(serializer.data)