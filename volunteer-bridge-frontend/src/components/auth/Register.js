import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || '';
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    is_volunteer: defaultRole === 'volunteer',
    is_organization: defaultRole === 'organization',
    skills: [],
    interests: []
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    // Ensure at least one role is selected
    if (!formData.is_volunteer && !formData.is_organization) {
      return setError('Please select at least one role');
    }
    
    setLoading(true);
    
    try {
      await AuthService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        is_volunteer: formData.is_volunteer,
        is_organization: formData.is_organization,
        skills: [],
        interests: []
      });
      
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Create an Account</Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>I am a: (select all that apply)</Form.Label>
                  <div>
                    <Form.Check
                      type="checkbox"
                      label="Volunteer"
                      name="is_volunteer"
                      checked={formData.is_volunteer}
                      onChange={handleChange}
                    />
                    <Form.Check
                      type="checkbox"
                      label="Organization"
                      name="is_organization"
                      checked={formData.is_organization}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100" 
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <p>Already have an account? <Link to="/login">Log in here</Link></p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
// This code is a React component for a registration page.