from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from rest_framework import status

class AuthenticationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.token_url = reverse('token_obtain_pair')
        
    def test_registration(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123',
            'email': 'test@example.com',
            'is_volunteer': True,
            'is_organization': False
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify user type was set correctly
        self.assertTrue(response.data['is_volunteer'])
        self.assertFalse(response.data['is_organization'])


