// src/components/dashboard/SimplifiedDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const SimplifiedDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [volunteerHours, setVolunteerHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch general opportunities (works for both user types)
        const opportunitiesResponse = await apiClient.get('opportunities/');
        setOpportunities(opportunitiesResponse.data);

        // Fetch applications if user is a volunteer
        if (currentUser?.is_volunteer) {
          const applicationsResponse = await apiClient.get('applications/volunteer/');
          setApplications(applicationsResponse.data);

          const hoursResponse = await apiClient.get('volunteer-hours/');
          setVolunteerHours(hoursResponse.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load some dashboard data. Displaying available information.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">My Dashboard</h1>
      
      {error && (
        <Alert variant="warning" className="mb-4">
          {error}
        </Alert>
      )}

      {/* User Profile Summary */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <h5>Welcome, {currentUser?.username}!</h5>
              <p className="text-muted">
                {currentUser?.is_volunteer ? 'Volunteer Account' : 'Organization Account'}
              </p>
            </Col>
            <Col md={8}>
              <Row>
                <Col xs={6} md={4} className="text-center mb-3">
                  <h3>{applications?.length || 0}</h3>
                  <p className="text-muted">Applications</p>
                </Col>
                <Col xs={6} md={4} className="text-center mb-3">
                  <h3>{volunteerHours?.length || 0}</h3>
                  <p className="text-muted">Hours Logged</p>
                </Col>
                <Col xs={6} md={4} className="text-center mb-3">
                  <h3>{opportunities?.length || 0}</h3>
                  <p className="text-muted">Available Opportunities</p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Recent Applications for Volunteers */}
      {currentUser?.is_volunteer && applications.length > 0 && (
        <Card className="mb-4">
          <Card.Header as="h5">My Recent Applications</Card.Header>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map(app => (
                  <tr key={app.id}>
                    <td>
                      <Link to={`/opportunities/${app.opportunity}`}>
                        {app.opportunity_title || `Opportunity #${app.opportunity}`}
                      </Link>
                    </td>
                    <td>
                      <Badge bg={
                        app.status === 'APPROVED' ? 'success' :
                        app.status === 'PENDING' ? 'warning' :
                        'danger'
                      }>
                        {app.status}
                      </Badge>
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Latest Opportunities */}
      <Card className="mb-4">
        <Card.Header as="h5">
          {currentUser?.is_volunteer ? 'Recommended Opportunities' : 'My Opportunities'}
        </Card.Header>
        <Card.Body>
          <Row>
            {opportunities.slice(0, 3).map(opportunity => (
              <Col md={4} key={opportunity.id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{opportunity.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {opportunity.location}
                    </Card.Subtitle>
                    <Card.Text>
                      {opportunity.description.substring(0, 100)}...
                    </Card.Text>
                    <Link to={`/opportunities/${opportunity.id}`} className="btn btn-outline-primary btn-sm">
                      View Details
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SimplifiedDashboard;
