import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Row, Col, Card } from 'react-bootstrap';
import apiClient from '../../services/api';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    skills: [],
    interests: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('profile/');
      setProfile({
        username: response.data.username || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        bio: response.data.bio || '',
        skills: response.data.skills || [],
        interests: response.data.interests || []
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await apiClient.put('profile/', profile);
      setSuccess('Profile updated successfully!');
      
      // Redirect back to profile after 2 seconds
      setTimeout(() => {
        navigate('/profile', { state: { refreshProfile: true } });
      }, 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return <Container><div>Loading profile...</div></Container>;
  }

  return (
    <Container>
      <Row className="justify-content-center mt-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">Edit Profile</Card.Title>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={profile.username}
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
                        value={profile.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="(123) 456-7890"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                        placeholder="City, State"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself, your experience, and what motivates you to volunteer..."
                  />
                </Form.Group>
                
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary">Save Changes</Button>
                  <Button 
                    type="button" 
                    variant="outline-secondary"
                    onClick={() => navigate('/profile')}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;
