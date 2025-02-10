import pytest
from django.urls import reverse
from rest_framework import status
from .models import Opportunity
from datetime import datetime, timedelta

@pytest.mark.django_db
class TestOpportunities:
    @pytest.fixture
    def org_user(self, client):
        # Create and return an organization user
        data = {
            'username': 'orguser',
            'password': 'testpass123',
            'email': 'org@test.com',
            'is_organization': True
        }
        return client.post(reverse('register'), data).json()

    def test_create_opportunity(self, client, org_user):
        # Login as organization
        token = client.post(reverse('token_obtain_pair'), {
            'username': 'orguser',
            'password': 'testpass123'
        }).json()['access']
        
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        data = {
            'title': 'Test Opportunity',
            'description': 'Test Description',
            'required_skills': ['python', 'django'],
            'start_date': (datetime.now() + timedelta(days=1)).isoformat(),
            'end_date': (datetime.now() + timedelta(days=2)).isoformat(),
            'location': 'Test Location',
            'max_volunteers': 5
        }
        
        response = client.post(reverse('opportunity-list'), data)
        assert response.status_code == status.HTTP_201_CREATED
