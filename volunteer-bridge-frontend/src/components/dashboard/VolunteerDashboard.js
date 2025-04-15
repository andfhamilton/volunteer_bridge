import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../services/api';

const VolunteerDashboard = () => {
    const [errorInfo, setErrorInfo] = useState(null);

  if (errorInfo) {
    console.error('Component stack:', errorInfo.componentStack);
  }

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [volunteerHours, setVolunteerHours] = useState([]);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    totalHours: 0,
    verifiedHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not a volunteer
    if (currentUser && !currentUser.is_volunteer) {
      navigate('/');
      return;
    }

    const fetchDashboardData = async () => {
      //if (!currentUser) return;
      
      try {
        // Add request start logging
        console.groupCollapsed('[Dashboard] Starting data fetch');
        console.log('Current user:', currentUser);
        console.log('Auth token:', localStorage.getItem('token'));
    
        // Applications request
        console.log('[1/3] Fetching applications...');
        const applicationsResponse = await apiClient.get('applications/volunteer/');
        console.log('Applications response:', applicationsResponse);
        setApplications(applicationsResponse.data);
    
        // Volunteer hours request
        console.log('[2/3] Fetching volunteer hours...');
        const hoursResponse = await apiClient.get('volunteer-hours/');
        console.log('Volunteer hours response:', hoursResponse);
        setVolunteerHours(hoursResponse.data);
    
        // Recommended opportunities request
        console.log('[3/3] Fetching recommended opportunities...');
        const recommendedResponse = await apiClient.get('opportunities/recommended/');
        console.log('Recommended opportunities response:', recommendedResponse);
        setRecommendedOpportunities(recommendedResponse.data);
    
        console.groupEnd();
      } catch (err) {
        // Enhanced error logging
        console.groupCollapsed('[Dashboard] Error Details');
        console.error('Full error object:', err);
        
        if (err.response) {
          console.log('HTTP Status:', err.response.status);
          console.log('Response Data:', err.response.data);
          console.log('Response Headers:', err.response.headers);
        } else if (err.request) {
          console.log('Request was made but no response received:', err.request);
        } else {
          console.log('Error setting up request:', err.message);
        }
        
        console.log('Error config:', err.config);
        console.groupEnd();
    
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    

    fetchDashboardData();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
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

  if (!currentUser || !currentUser.is_volunteer) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          This dashboard is only available to volunteer accounts.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Volunteer Dashboard</h1>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title>Applications</Card.Title>
              <h2>{stats.totalApplications}</h2>
              <p className="text-muted">
                {stats.approvedApplications} approved, {stats.pendingApplications} pending
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title>Volunteer Hours</Card.Title>
              <h2>{stats.totalHours}</h2>
              <p className="text-muted">{stats.verifiedHours} verified hours</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title>Skills & Interests</Card.Title>
              <div className="d-flex flex-wrap justify-content-center gap-1 mt-3">
                {currentUser.skills && currentUser.skills.map((skill, index) => (
                  <Badge bg="secondary" key={`skill-${index}`} className="p-2 m-1">
                    {skill}
                  </Badge>
                ))}
                {currentUser.interests && currentUser.interests.map((interest, index) => (
                  <Badge bg="info" key={`interest-${index}`} className="p-2 m-1">
                    {interest}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for Applications, Hours, and Recommendations */}
      <Tabs defaultActiveKey="applications" className="mb-4">
        <Tab eventKey="applications" title="My Applications">
          {applications.length === 0 ? (
            <Alert variant="info">
              You haven't applied to any opportunities yet. 
              <Link to="/opportunities" className="ms-2">Browse opportunities</Link>
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Organization</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(application => (
                  <tr key={application.id}>
                    <td>{application.opportunity_title}</td>
                    <td>{application.organization_name}</td>
                    <td>
                      <Badge bg={
                        application.status === 'PENDING' ? 'warning' :
                        application.status === 'APPROVED' ? 'success' :
                        application.status === 'REJECTED' ? 'danger' : 'secondary'
                      }>
                        {application.status}
                      </Badge>
                    </td>
                    <td>{new Date(application.created_at).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        as={Link} 
                        to={`/opportunities/${application.opportunity_id}`} 
                        variant="outline-primary" 
                        size="sm"
                      >
                        View Opportunity
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="hours" title="Volunteer Hours">
          {volunteerHours.length === 0 ? (
            <Alert variant="info">
              You haven't logged any volunteer hours yet.
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {volunteerHours.map(record => (
                  <tr key={record.id}>
                    <td>{record.opportunity_title}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.hours}</td>
                    <td>
                      <Badge bg={record.verified ? 'success' : 'warning'}>
                        {record.verified ? 'Verified' : 'Pending Verification'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="recommended" title="Recommended Opportunities">
          {recommendedOpportunities.length === 0 ? (
            <Alert variant="info">
              We don't have any recommendations for you at the moment. 
              <Link to="/opportunities" className="ms-2">Browse all opportunities</Link>
            </Alert>
          ) : (
            <Row>
              {recommendedOpportunities.map(opportunity => (
                <Col md={4} key={opportunity.id} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>{opportunity.title}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">{opportunity.organization_name}</Card.Subtitle>
                      <Card.Text>{opportunity.description.substring(0, 100)}...</Card.Text>
                      <Button 
                        as={Link} 
                        to={`/opportunities/${opportunity.id}`} 
                        variant="outline-primary"
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default VolunteerDashboard;
