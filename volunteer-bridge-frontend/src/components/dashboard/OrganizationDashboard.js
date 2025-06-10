import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../services/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrganizationDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not an organization
    if (currentUser && !currentUser.is_organization) {
      navigate('/');
      return;
    }

    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        // Fetch organization's opportunities
        const opportunitiesResponse = await apiClient.get('/opportunities/organization/');
        setOpportunities(opportunitiesResponse.data);
        
        // Fetch applications for all opportunities
        const applicationsResponse = await apiClient.get('applications/organization/');
        setApplications(applicationsResponse.data);
        
        // Calculate stats
        const activeOpps = opportunitiesResponse.data.filter(opp => opp.status === 'OPEN').length;
        const approvedApps = applicationsResponse.data.filter(app => app.status === 'APPROVED').length;
        const pendingApps = applicationsResponse.data.filter(app => app.status === 'PENDING').length;
        
        setStats({
          totalOpportunities: opportunitiesResponse.data.length,
          activeOpportunities: activeOpps,
          totalApplications: applicationsResponse.data.length,
          approvedApplications: approvedApps,
          pendingApplications: pendingApps
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, navigate]);

  // Prepare chart data
  const chartData = {
    labels: ['Total Opportunities', 'Active Opportunities', 'Total Applications', 'Approved Applications', 'Pending Applications'],
    datasets: [
      {
        label: 'Dashboard Statistics',
        data: [
          stats.totalOpportunities,
          stats.activeOpportunities,
          stats.totalApplications,
          stats.approvedApplications,
          stats.pendingApplications
        ],
        backgroundColor: [
          'rgba(143, 51, 205, 0.6)',
          'rgba(40, 164, 64, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(143, 51, 205, 1)',
          'rgba(40, 164, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

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

  if (!currentUser || !currentUser.is_organization) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          This dashboard is only available to organization accounts.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Organization Dashboard</h1>
        <Button as={Link} to="/opportunities/create" variant="primary">
          Create New Opportunity
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title>Opportunities</Card.Title>
              <h2>{stats.totalOpportunities}</h2>
              <p className="text-muted">{stats.activeOpportunities} active</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title>Applications</Card.Title>
              <h2>{stats.totalApplications}</h2>
              <p className="text-muted">{stats.pendingApplications} pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title>Approved Volunteers</Card.Title>
              <h2>{stats.approvedApplications}</h2>
              <p className="text-muted">Across all opportunities</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Dashboard Overview</Card.Title>
          <div style={{ height: '300px' }}>
            <Bar 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }} 
            />
          </div>
        </Card.Body>
      </Card>

      {/* Tabs for Opportunities and Applications */}
      <Tabs defaultActiveKey="opportunities" className="mb-4">
        <Tab eventKey="opportunities" title="My Opportunities">
          {opportunities.length === 0 ? (
            <Alert variant="info">
              You haven't created any opportunities yet. 
              <Link to="/opportunities/create" className="ms-2">Create your first opportunity</Link>
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Date Range</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map(opportunity => (
                  <tr key={opportunity.id}>
                    <td>{opportunity.title}</td>
                    <td>
                      <Badge bg={
                        opportunity.status === 'OPEN' ? 'success' :
                        opportunity.status === 'CLOSED' ? 'secondary' :
                        opportunity.status === 'FILLED' ? 'info' : 'secondary'
                      }>
                        {opportunity.status}
                      </Badge>
                    </td>
                    <td>
                      {applications.filter(app => app.opportunity_id === opportunity.id).length}
                    </td>
                    <td>
                      {new Date(opportunity.start_date).toLocaleDateString()} - {new Date(opportunity.end_date).toLocaleDateString()}
                    </td>
                    <td>
                      <Button 
                        as={Link} 
                        to={`/opportunities/${opportunity.id}`} 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                      >
                        View
                      </Button>
                      <Button 
                        as={Link} 
                        to={`/opportunities/edit/${opportunity.id}`} 
                        variant="outline-secondary" 
                        size="sm" 
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button 
                        as={Link} 
                        to={`/opportunities/${opportunity.id}/applications`} 
                        variant="outline-info" 
                        size="sm"
                      >
                        Applications
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="applications" title="Recent Applications">
          {applications.length === 0 ? (
            <Alert variant="info">
              You haven't received any applications yet.
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Opportunity</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map(application => (
                  <tr key={application.id}>
                    <td>{application.volunteer_name}</td>
                    <td>{application.opportunity_title}</td>
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
                        to={`/opportunities/${application.opportunity_id}/applications`} 
                        variant="outline-primary" 
                        size="sm"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {applications.length > 10 && (
            <div className="text-center mt-3">
              <Button variant="outline-secondary" size="sm">
                View All Applications
              </Button>
            </div>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default OrganizationDashboard;
