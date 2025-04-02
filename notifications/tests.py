from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Notification
from .utils import create_notification

User = get_user_model()

class NotificationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_notification(self):
        create_notification(self.user, 'opportunity', 'Test notification')
        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(Notification.objects.first().user, self.user)

    def test_list_notifications(self):
        create_notification(self.user, 'opportunity', 'Test notification')
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_mark_notification_as_read(self):
        notification = create_notification(self.user, 'opportunity', 'Test notification')
        response = self.client.post(f'/api/notifications/{notification.id}/mark_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Notification.objects.first().is_read)

