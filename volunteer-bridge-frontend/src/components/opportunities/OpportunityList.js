import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';

const OpportunityList = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await apiClient.get('opportunities/');
        setOpportunities(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities. Please try again later.');
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

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

  return (
    <Container>
      <h1 className="my-4">Volunteer Opportunities</h1>
      
      {opportunities.length === 0 ? (
        <Alert variant="info">No opportunities available at this time.</Alert>
      ) : (
        <Row>
          {opportunities.map((opportunity) => (
            <Col md={4} className="mb-4" key={opportunity.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{opportunity.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {opportunity.location}
                  </Card.Subtitle>
                  <Card.Text>
                    {opportunity.description.length > 100
                      ? `${opportunity.description.substring(0, 100)}...`
                      : opportunity.description}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {new Date(opportunity.start_date).toLocaleDateString()} to{' '}
                      {new Date(opportunity.end_date).toLocaleDateString()}
                    </small>
                    <Button
                      as={Link}
                      to={`/opportunities/${opportunity.id}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default OpportunityList;
// This component fetches and displays a list of volunteer opportunities.