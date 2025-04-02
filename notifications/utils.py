from .models import Notification

def create_notification(user, notification_type, message, related_object_id=None):
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        message=message,
        related_object_id=related_object_id
    )
