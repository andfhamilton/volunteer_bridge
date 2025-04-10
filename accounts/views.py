
from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer, MessageSerializer
from rest_framework.decorators import action, api_view, permission_classes, renderer_classes
from rest_framework.renderers import JSONRenderer
from .models import User, Message
from django.db.models import Q
from notifications.utils import create_notification
from .serializers import UserSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@renderer_classes([JSONRenderer])
def current_user(request):
    """Return the authenticated user's details"""
    # Add debugging
    print(f"Current user view called. User: {request.user}, Authenticated: {request.user.is_authenticated}")
    
    try:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        print(f"Error in current_user view: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
def test_auth(request):
    """Simple view to test if authentication is working"""
    return Response({
        "message": "Authentication successful",
        "user_id": request.user.id,
        "username": request.user.username
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Alternative endpoint to get user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.all()

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
