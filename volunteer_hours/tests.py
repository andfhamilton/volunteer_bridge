import pytest
import json
from django.urls import reverse
from rest_framework import status
from datetime import datetime, timedelta
from .models import VolunteerHour
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestVolunteerHours:
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

    @pytest.fixture
    def opportunity(self, org_client):
        """Create an opportunity for testing"""
        data = {
            'title': 'Test Opportunity',
            'description': 'Test Description',
            'required_skills': json.dumps(['python', 'django']),
            'start_date': datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'end_date': (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'location': 'Test Location',
            'max_volunteers': 5,
            'status': 'OPEN'
        }
        response = org_client.post(reverse('opportunity-list'), data)
        return response.json()
    
    
    @pytest.fixture
    def hour_data(self, opportunity):
        now = datetime.now()
        return {
            'opportunity': opportunity['id'],
            'start_time': now.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'end_time': (now + timedelta(hours=2)).strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'notes': 'Test volunteer hours'
        }

    def test_create_hours(self, vol_client, hour_data):
        """Test volunteer can log hours"""
        response = vol_client.post(reverse('volunteerhour-list'), hour_data)
        if response.status_code != status.HTTP_201_CREATED:
            print("Error response:", response.data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['volunteer'] is not None

    def test_verify_hours(self, org_client, vol_client, hour_data):
        """Test organization can verify hours"""
        # First create hours as volunteer
        hour_response = vol_client.post(reverse('volunteerhour-list'), hour_data)
        hour_id = hour_response.data['id']

        # Then verify as organization
        verify_url = reverse('volunteerhour-verify', args=[hour_id])
        response = org_client.post(verify_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'hours verified'

    def test_list_hours(self, vol_client, hour_data):
        """Test volunteer can list their hours"""
        # Create hours first
        vol_client.post(reverse('volunteerhour-list'), hour_data)
        
        # Then list hours
        response = vol_client.get(reverse('volunteerhour-list'))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0

    def test_unauthorized_verify(self, vol_client, hour_data):
        """Test volunteer cannot verify hours"""
        # Create hours first
        hour_response = vol_client.post(reverse('volunteerhour-list'), hour_data)
        hour_id = hour_response.data['id']

        # Attempt to verify as volunteer
        verify_url = reverse('volunteerhour-verify', args=[hour_id])
        response = vol_client.post(verify_url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
