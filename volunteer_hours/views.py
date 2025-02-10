from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import VolunteerHour
from .serializers import VolunteerHourSerializer
from accounts.permissions import IsOrganization

class VolunteerHourViewSet(viewsets.ModelViewSet):
    queryset = VolunteerHour.objects.all()
    serializer_class = VolunteerHourSerializer

    def get_permissions(self):
        if self.action in ['verify', 'unverify']:
            permission_classes = [IsOrganization]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(volunteer=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_organization:
            return VolunteerHour.objects.filter(opportunity__organization=user)
        return VolunteerHour.objects.filter(volunteer=user)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        hour = self.get_object()
        hour.verified = True
        hour.verified_by = request.user
        hour.save()
        serializer = self.get_serializer(hour)
        return Response({'status': 'hours verified'})
