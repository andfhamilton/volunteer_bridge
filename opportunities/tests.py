import pytest
import json
from django.urls import reverse
from rest_framework import status
from datetime import datetime, timedelta
from accounts.models import User
from .models import Opportunity
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestOpportunities:
    @pytest.fixture
    def org_user(self, client):
        # Create and return an organization user
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
    def volunteer_user(self, client):
        # Create and return a volunteer user
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
    def vol_client(self, client, volunteer_user):
        # Returns an authenticated client for volunteer user
        client = APIClient()
        token = client.post(reverse('token_obtain_pair'), {
            'username': 'voluser',
            'password': 'testpass123'
        }).json()['access']
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return client

    @pytest.fixture
    def opportunity_data(self):      
        now = datetime.now()
        return {
            'title': 'Test Opportunity',
            'description': 'Test Description',
            'required_skills': json.dumps(['python', 'django']),  # Convert to JSON string
            'start_date': now.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'end_date': (now + timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'location': 'Test Location',
            'max_volunteers': 5,
            'status': 'OPEN'
        }

    def test_create_opportunity_as_org(self, org_client, opportunity_data):
        """Test creating an opportunity as an organization"""
        response = org_client.post(reverse('opportunity-list'), opportunity_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == opportunity_data['title']

    def test_create_opportunity_as_volunteer(self, vol_client, opportunity_data):
        """Test that volunteers cannot create opportunities"""
        response = vol_client.post(reverse('opportunity-list'), opportunity_data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_list_opportunities(self, vol_client, org_client, opportunity_data):
        """Test listing opportunities"""
        # Create an opportunity first
        org_client.post(reverse('opportunity-list'), opportunity_data)
        
        # Test that both org and volunteer can list opportunities
        response = vol_client.get(reverse('opportunity-list'))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0

    def test_retrieve_opportunity(self, org_client, opportunity_data):
        """Test retrieving a single opportunity"""
        # Create an opportunity
        create_response = org_client.post(reverse('opportunity-list'), opportunity_data)
        opp_id = create_response.data['id']
        
        # Retrieve the opportunity
        response = org_client.get(reverse('opportunity-detail', args=[opp_id]))
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == opportunity_data['title']

    def test_update_opportunity(self, org_client, opportunity_data):
        """Test updating an opportunity"""
        # Create an opportunity
        create_response = org_client.post(reverse('opportunity-list'), opportunity_data)
        opp_id = create_response.data['id']
        
        # Update the opportunity
        updated_data = opportunity_data.copy()
        updated_data['title'] = 'Updated Title'
        response = org_client.put(
            reverse('opportunity-detail', args=[opp_id]),
            updated_data
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Title'

    def test_delete_opportunity(self, org_client, opportunity_data):
        """Test deleting an opportunity"""
        # Create an opportunity
        create_response = org_client.post(reverse('opportunity-list'), opportunity_data)
        opp_id = create_response.data['id']
        
        # Delete the opportunity
        response = org_client.delete(reverse('opportunity-detail', args=[opp_id]))
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's deleted
        get_response = org_client.get(reverse('opportunity-detail', args=[opp_id]))
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
class TestMatchingSystem:
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
    def org_client(self, client, org_user):
        client = APIClient()
        token = client.post(reverse('token_obtain_pair'), {
            'username': 'orguser',
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
            'required_skills': json.dumps(['python', 'django']),  # Note the json.dumps
            'start_date': '2025-02-15T10:00:00Z',
            'end_date': '2025-02-20T18:00:00Z',
            'location': 'Remote',
            'max_volunteers': 5,
            'status': 'OPEN'
        }
        response = org_client.post(reverse('opportunity-list'), data)
        return response.json()

    @pytest.fixture
    def volunteer(self, client):
        """Create a volunteer user for testing"""
        data = {
            'username': 'volunteer1',
            'password': 'testpass123',
            'email': 'volunteer1@test.com',
            'is_volunteer': True,
            'skills': [],  # Empty list as per our User model
            'interests': []  # Empty list as per our User model
        }
        response = client.post(reverse('register'), data)
        return response.json()

    def test_matching_system(self, org_client, opportunity, volunteer):
        """Test the matching system for an opportunity"""
        match_url = reverse('opportunity-matches', args=[opportunity['id']])
        response = org_client.get(match_url)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)  # Response should be a list of matches

# Event tests
@pytest.mark.django_db
class TestEventSystem:
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
    def event_data(self):
        return {
            'title': 'Test Event',
            'description': 'This is a test event.',
            'start_time': '2025-02-15T10:00:00Z',
            'end_time': '2025-02-15T12:00:00Z',
            'location': 'Test Location'
        }

    def test_create_event(self, org_client, event_data):
        response = org_client.post(reverse('event-list'), event_data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == event_data['title']

    def test_list_events(self, org_client, vol_client, event_data):
        create_response = org_client.post(reverse('event-list'), event_data)
        assert create_response.status_code == status.HTTP_201_CREATED

        response = vol_client.get(reverse('event-list'))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0

    def test_attend_event(self, vol_client, org_client, event_data):
        response = org_client.post(reverse('event-list'), event_data)
        event_id = response.data['id']
        attend_url = reverse('event-attend', args=[event_id])
        response = vol_client.post(attend_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'registered for event'
