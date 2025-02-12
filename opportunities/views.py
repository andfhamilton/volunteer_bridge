from rest_framework import viewsets, permissions, status
from django.db.models import Q
from rest_framework.response import Response
from .models import Opportunity, Event
from rest_framework.decorators import action
from .serializers import OpportunitySerializer, EventSerializer
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
        event.attendees.add(request.user)
        return Response({'status': 'registered for event'})

