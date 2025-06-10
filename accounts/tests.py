import pytest
from rest_framework import status
from django.urls import reverse
from .models import Message
from rest_framework.test import APIClient

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

@pytest.mark.django_db
class TestMessaging:

    @pytest.fixture
    def message_data(self, vol_user):
        return {
            'recipient': vol_user['id'],
            'subject': 'Test Message',
            'content': 'This is a test message'
        }

    def test_send_message(self, org_client, message_data):
        """Test sending a message"""
        response = org_client.post(reverse('message-list'), message_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['subject'] == message_data['subject']
        assert response.data['content'] == message_data['content']

    def test_list_messages(self, org_client, vol_client, message_data):
        """Test listing messages"""
        # Create a message
        org_client.post(reverse('message-list'), message_data)
        
        # Test organization can see sent message
        org_response = org_client.get(reverse('message-list'))
        assert org_response.status_code == status.HTTP_200_OK
        assert len(org_response.data) > 0
        
        # Test volunteer can see received message
        vol_response = vol_client.get(reverse('message-list'))
        assert vol_response.status_code == status.HTTP_200_OK
        assert len(vol_response.data) > 0

    def test_mark_as_read(self, org_client, vol_client, message_data):
        """Test marking a message as read"""
        # Create a message
        response = org_client.post(reverse('message-list'), message_data)
        message_id = response.data['id']
        
        # Mark as read
        read_url = reverse('message-mark-read', args=[message_id])
        response = vol_client.post(read_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['read'] == True

    @pytest.fixture
    def org_user(self, client):
        data = {
            'username': 'orguser',
            'password': 'testpass123',
            'email': 'org@test.com',
            'is_organization': True,
            'skills': [],
            'interests': []
        }
        response = client.post(reverse('register'), data)
        return response.json()

    @pytest.fixture
    def vol_user(self, client):
        data = {
            'username': 'voluser',
            'password': 'testpass123',
            'email': 'vol@test.com',
            'is_volunteer': True,
            'is_organization': False,
            'skills': [],
            'interests': []
        }
        response = client.post(reverse('register'), data)
        return response.json()

    @pytest.fixture
    def org_client(self, client, org_user):
        client = APIClient()
        token = client.post(reverse('token_obtain_pair'), {
            'username': 'orguser',
            'password': 'testpass123'
        }).json()['access']
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return client

    @pytest.fixture
    def vol_client(self, client, vol_user):
        client = APIClient()
        token = client.post(reverse('token_obtain_pair'), {
            'username': 'voluser',
            'password': 'testpass123'
        }).json()['access']
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return client
