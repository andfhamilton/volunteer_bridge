from rest_framework import viewsets, permissions
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.mixins import UpdateModelMixin
from rest_framework.decorators import action
from rest_framework.response import Response

class NotificationViewSet(viewsets.ReadOnlyModelViewSet, UpdateModelMixin):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['POST'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
