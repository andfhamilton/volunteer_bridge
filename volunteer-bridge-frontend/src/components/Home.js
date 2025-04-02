import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container>
      <Row className="mb-5">
        <Col>
          <div className="text-center py-5">
            <h1>Volunteer Bridge</h1>
            <p className="lead">Connecting volunteers with meaningful opportunities to make a difference.</p>
            <Button as={Link} to="/opportunities" variant="primary" size="lg" className="me-2">
              Find Opportunities
            </Button>
            <Button as={Link} to="/register" variant="outline-primary" size="lg">
              Sign Up
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>For Volunteers</Card.Title>
              <Card.Text>
                Discover opportunities that match your skills and interests.
                Track your volunteer hours and make a difference in your community.
              </Card.Text>
              <Button as={Link} to="/register?role=volunteer" variant="outline-primary">Get Started</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>For Organizations</Card.Title>
              <Card.Text>
                Post volunteer opportunities, manage events, and find dedicated volunteers
                for your cause.
              </Card.Text>
              <Button as={Link} to="/register?role=organization" variant="outline-primary">Get Started</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Upcoming Events</Card.Title>
              <Card.Text>
                Join our community events, workshops, and volunteer drives.
                Connect with others who share your passion for service.
              </Card.Text>
              <Button as={Link} to="/events" variant="outline-primary">View Events</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
// This Home component serves as the landing page for the Volunteer Bridge application.
