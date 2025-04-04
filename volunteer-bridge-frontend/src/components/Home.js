import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Banner from './shared/Banner';

const Home = () => {
  return (
    <>
      <Banner />
      <Container className="my-5"></Container>
      <Container>
        

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
    </>
  );
};

export default Home;
