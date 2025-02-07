from django.test import TestCase

# accounts/tests.py
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import User

class UserTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'is_volunteer': True
        }
        
    def test_create_user(self):
        response = self.client.post(reverse('user-list'), self.user_data)
        self.assertEqual(response.status_code, 201)

