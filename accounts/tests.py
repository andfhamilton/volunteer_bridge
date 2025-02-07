import pytest
from rest_framework import status
from django.urls import reverse

@pytest.mark.django_db
class TestAuthentication:
    def test_registration(self, client):
        url = reverse('register')
        data = {
            'username': 'testuser',
            'password': 'testpass123',
            'email': 'test@example.com',
            'is_volunteer': True,
            'is_organization': False,
            'skills': [],
            'interests': []
        }
        response = client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert 'username' in response.data
