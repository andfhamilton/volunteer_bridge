// src/components/shared/Banner.js
import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Banner = () => {
  return (
    <div 
      className="home-banner" 
      style={{ 
        backgroundImage: 'url("/images/bridge-banner.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '400px',
        position: 'relative'
      }}
    >
      <div className="overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)'
      }}></div>
      <Container className="d-flex align-items-center justify-content-center h-100 position-relative">
        <div className="text-center text-white">
          <h1 className="display-4 fw-bold">Volunteer Bridge</h1>
          <p className="lead">Connecting volunteers with meaningful opportunities</p>
          <Button as={Link} to="/opportunities" variant="primary" size="lg" className="me-2">
              Find Opportunities
            </Button>
            <Button as={Link} to="/register" variant="secondary" size="lg">
              Sign Up
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Banner;
