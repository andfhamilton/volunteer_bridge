
from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer, MessageSerializer
from rest_framework.decorators import action, api_view, permission_classes, renderer_classes
from rest_framework.renderers import JSONRenderer
from .models import User, Message, Application
from django.db.models import Q
from notifications.utils import create_notification
from .serializers import UserSerializer, ApplicationSerializer
from opportunities.models import Opportunity


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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_to_opportunity(request, opportunity_id):
    """Apply to an opportunity"""
    if not request.user.is_volunteer:
        return Response({"detail": "Only volunteers can apply to opportunities"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        opportunity = Opportunity.objects.get(id=opportunity_id)
    except Opportunity.DoesNotExist:
        return Response({"detail": "Opportunity not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if already applied
    existing_application = Application.objects.filter(
        volunteer=request.user,
        opportunity=opportunity
    ).first()
    
    if existing_application:
        return Response({"detail": "You have already applied to this opportunity"}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    # Create application
    application = Application(
        volunteer=request.user,
        opportunity=opportunity,
        note=request.data.get('note', '')
    )
    application.save()
    
    serializer = ApplicationSerializer(application)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def volunteer_applications(request):
    """List applications submitted by the current volunteer"""
    if not request.user.is_volunteer:
        return Response({"detail": "Only volunteers can access this endpoint"}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    applications = Application.objects.filter(volunteer=request.user)
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organization_applications(request):
    """List applications for all opportunities of the organization"""
    if not request.user.is_organization:
        return Response({"detail": "Only organizations can access this endpoint"}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    applications = Application.objects.filter(opportunity__organization=request.user)
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def opportunity_applications(request, opportunity_id):
    """List applications for a specific opportunity"""
    try:
        opportunity = Opportunity.objects.get(id=opportunity_id)
    except Opportunity.DoesNotExist:
        return Response({"detail": "Opportunity not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Only the organization that created the opportunity can view its applications
    if request.user != opportunity.organization:
        return Response({"detail": "You don't have permission to view these applications"}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    applications = Application.objects.filter(opportunity=opportunity)
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    """Update the status of an application (approve/reject)"""
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return Response({"detail": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Only the organization that owns the opportunity can update application status
    if request.user != application.opportunity.organization:
        return Response({"detail": "You don't have permission to update this application"}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    status_value = request.data.get('status')
    if status_value not in [choice[0] for choice in Application.STATUS_CHOICES]:
        return Response({"detail": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST)
    
    application.status = status_value
    application.save()
    
    serializer = ApplicationSerializer(application)
    return Response(serializer.data)