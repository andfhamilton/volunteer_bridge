import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const OpportunityDetail = () => {
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await apiClient.get(`opportunities/${id}/`);
        setOpportunity(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching opportunity:', err);
        setError('Failed to load opportunity details. Please try again later.');
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  const handleApply = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      // This would be replaced with your actual endpoint for applying
      await apiClient.post(`opportunities/${id}/apply/`);
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!opportunity) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Opportunity not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col lg={8}>
          <h1>{opportunity.title}</h1>
          <p className="lead">{opportunity.location}</p>
          
          <Card className="mb-4">
            <Card.Body>
              <h5>Description</h5>
              <p>{opportunity.description}</p>
              
              <h5>When</h5>
              <p>
                {new Date(opportunity.start_date).toLocaleDateString()} to{' '}
                {new Date(opportunity.end_date).toLocaleDateString()}
              </p>
              
              <h5>Required Skills</h5>
              <div>
                {opportunity.required_skills && opportunity.required_skills.length > 0 ? (
                  opportunity.required_skills.map((skill, index) => (
                    <Badge bg="secondary" className="me-2 mb-2" key={index}>
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p>No specific skills required.</p>
                )}
              </div>
            </Card.Body>
          </Card>
          
          {currentUser && currentUser.is_volunteer && (
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? 'Submitting...' : 'Apply Now'}
            </Button>
          )}
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <h5>Organization</h5>
              <p>{opportunity.organization_name || 'Organization information not available'}</p>
              
              <h5>Status</h5>
              <Badge bg={opportunity.status === 'OPEN' ? 'success' : 'secondary'}>
                {opportunity.status}
              </Badge>
              
              <h5 className="mt-3">Spots Available</h5>
              <p>{opportunity.max_volunteers || 'Unlimited'}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OpportunityDetail;
// This component fetches and displays the details of a specific volunteer opportunity.