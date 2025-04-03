import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Volunteer Bridge</h5>
            <p>Connecting volunteers with opportunities to make a difference.</p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/opportunities">Find Opportunities</a></li>
              <li><a href="/events">Upcoming Events</a></li>
              <li><a href="/about">About Us</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact</h5>
            <address>
              <p>Email: info@volunteerbridge.org</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </Col>
        </Row>
        <Row>
          <Col className="text-center pt-3">
            <p>&copy; {new Date().getFullYear()} Volunteer Bridge. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
