
from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer, MessageSerializer
from rest_framework.decorators import action
from .models import User, Message
from django.db.models import Q
from notifications.utils import create_notification

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        )

    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        
        # Notify recipient about new message
        create_notification(
            user=message.recipient,
            notification_type='message',
            message=f"New message from {self.request.user.username}: {message.subject}",
            related_object_id=message.id
        )
    
    @action(detail=True, methods=['POST'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        message.read = True
        message.save()
        serializer = self.get_serializer(message)
        return Response(serializer.data)
