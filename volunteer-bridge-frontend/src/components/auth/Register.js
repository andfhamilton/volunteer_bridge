import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Badge } from 'react-bootstrap';
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
  const availableSkills = [
    'Teaching', 'Mentoring', 'Administrative', 'Event Planning', 
    'Marketing', 'Fundraising', 'Technical', 'Medical', 'Legal'
  ];
  
  const availableInterests = [
    'Education', 'Environment', 'Health', 'Animals', 'Arts', 
    'Community Development', 'Disaster Relief', 'Human Rights'
  ];

  const handleSkillToggle = (skill) => {
    setFormData(prevData => {
      if (prevData.skills.includes(skill)) {
        return {
          ...prevData,
          skills: prevData.skills.filter(s => s !== skill)
        };
      } else {
        return {
          ...prevData,
          skills: [...prevData.skills, skill]
        };
      }
    });
  };
  const handleInterestToggle = (interest) => {
    setFormData(prevData => {
      if (prevData.interests.includes(interest)) {
        return {
          ...prevData,
          interests: prevData.interests.filter(i => i !== interest)
        };
      } else {
        return {
          ...prevData,
          interests: [...prevData.interests, interest]
        };
      }
    });
  };

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
                  <Form.Label>I am a:</Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      label="Volunteer"
                      name="userRole"
                      id="volunteerRole"
                      checked={formData.is_volunteer && !formData.is_organization}
                      onChange={() => setFormData({
                        ...formData,
                        is_volunteer: true,
                        is_organization: false
                      })}
                    />
                    <Form.Check
                      type="radio"
                      label="Organization"
                      name="userRole"
                      id="organizationRole"
                      checked={!formData.is_volunteer && formData.is_organization}
                      onChange={() => setFormData({
                        ...formData,
                        is_volunteer: false,
                        is_organization: true
                      })}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Skills (select all that apply)</Form.Label>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {availableSkills.map(skill => (
                      <Badge 
                        key={skill}
                        bg={formData.skills.includes(skill) ? "secondary" : "light"}
                        text={formData.skills.includes(skill) ? "white" : "dark"}
                        style={{ cursor: 'pointer'
                         }}
                        onClick={() => handleSkillToggle(skill)}
                        className="p-2"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Interests (select all that apply)</Form.Label>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {availableInterests.map(interest => (
                      <Badge 
                        key={interest}
                        bg={formData.interests.includes(interest) ? "secondary" : "light"}
                        text={formData.interests.includes(interest) ? "white" : "dark"}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleInterestToggle(interest)}
                        className="p-2"
                      >
                        {interest}
                      </Badge>
                    ))}
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