import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OpportunityList from '../OpportunityList';
import apiClient from '../../../services/api';

// Mock the API client
jest.mock('../../../services/api');

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('OpportunityList Component', () => {
  test('shows loading state initially and then displays data', async () => {
    // Mock API response
    apiClient.get.mockResolvedValue({ 
      data: [{ id: 1, title: 'Test Opportunity', description: 'Test Description' }] 
    });
    
    renderWithRouter(<OpportunityList />);
    
    // Check initial loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for the component to finish updating
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Check that opportunities are displayed
    expect(screen.getByText('Test Opportunity')).toBeInTheDocument();
  });
});
