import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const loginResponse = await AuthService.login(credentials.username, credentials.password);
      console.log('Login response:', loginResponse); // Check what's returned
      console.log('Token in localStorage:', localStorage.getItem('token')); // Verify token storage

      const userResponse = await AuthService.getCurrentUser();
      setCurrentUser(userResponse.data);
    // Redirect to intended page or home
    const from = location.state?.from?.pathname || '/';
    navigate(from);
    } catch (err) {
    setError('Failed to log in. Please check your credentials.');
    console.error(err);
    } finally {
    setLoading(false);
    }
    };

const checkToken = () => {
  const token = localStorage.getItem('token');
  console.log('Current token:', token);
  
  if (token) {
    // Check if token is properly formatted (should be a long string without extra quotes)
    console.log('Token length:', token.length);
    console.log('First 20 chars:', token.substring(0, 20));
    
    // Check if token is being sent in requests
    fetch('http://127.0.0.1:8000/api/opportunities/recommended/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('Test request status:', response.status);
      return response.json();
    })
    .then(data => console.log('Test request data:', data))
    .catch(err => console.error('Test request error:', err));
  } else {
    console.log('No token found in localStorage');
  }
};


  return (
    <Container>
    <Row className="justify-content-center mt-5">
      <Col md={6}>
        <Card>
          <Card.Body>
            <Card.Title className="text-center mb-4">Log In</Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              {/* Existing form fields */}
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100" 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
              
            </Form>
            <div className="text-center mt-3">
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);
};

export default Login;
// This code is a React component for a login page.