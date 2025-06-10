import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import apiClient from '../../services/api';

const Profile = () => {
  const location = useLocation();
  const { currentUser: contextUser } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message] = useState('');

  useEffect(() => {
    fetchCurrentProfile();
  }, [location.state?.refreshProfile]);

  const fetchCurrentProfile = async () => {
    try {
      const response = await apiClient.get('profile/');
      setCurrentUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to context user if API fails
      setCurrentUser(contextUser);
      setLoading(false);
    }
  };

  if (loading) {
    return <Container><div>Loading profile...</div></Container>;
  }

  if (!currentUser) {
    return <Container><div>Unable to load profile...</div></Container>;
  }

  return (
    <Container>
      <Row className="justify-content-center mt-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">My Profile</Card.Title>
              {message && <Alert variant="success">{message}</Alert>}
              
              <Row className="mb-4">
                <Col md={4}>
                  <h5>Username</h5>
                  <p>{currentUser.username}</p>
                </Col>
                <Col md={8}>
                  <h5>Email</h5>
                  <p>{currentUser.email}</p>
                </Col>
              </Row>
              
              <Row className="mb-4">
                <Col>
                  <h5>Role</h5>
                  <div>
                    {currentUser.is_volunteer && (
                      <Badge bg="primary" className="me-2">Volunteer</Badge>
                    )}
                    {currentUser.is_organization && (
                      <Badge bg="info">Organization</Badge>
                    )}
                  </div>
                </Col>
              </Row>
              {/* ✅ ADD: Phone and Address Section */}
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Phone</h5>
                  <p>{currentUser.phone || <span className="text-muted">Not provided</span>}</p>
                </Col>
                <Col md={6}>
                  <h5>Address</h5>
                  <p>{currentUser.address || <span className="text-muted">Not provided</span>}</p>
                </Col>
              </Row>

              {/* ✅ ADD: Bio Section */}
              {(currentUser.bio && currentUser.bio.trim()) && (
                <Row className="mb-4">
                  <Col>
                    <h5>Bio</h5>
                    <p>{currentUser.bio}</p>
                  </Col>
                </Row>
              )}
              
              {currentUser.is_volunteer && (
                <>
                  <Row className="mb-3">
                    <Col>
                      <h5>Skills</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {currentUser.skills && currentUser.skills.length > 0 ? (
                          currentUser.skills.map((skill, index) => (
                            <Badge key={index} bg="secondary" className="p-2">{skill}</Badge>
                          ))
                        ) : (
                          <p className="text-muted">No skills added yet</p>
                        )}
                      </div>
                    </Col>
                  </Row>
                  
                  <Row className="mb-4">
                    <Col>
                      <h5>Interests</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {currentUser.interests && currentUser.interests.length > 0 ? (
                          currentUser.interests.map((interest, index) => (
                            <Badge key={index} bg="secondary" className="p-2">{interest}</Badge>
                          ))
                        ) : (
                          <p className="text-muted">No interests added yet</p>
                        )}
                      </div>
                    </Col>
                  </Row>
                </>
              )}         
                            
              <Button as={Link} to="/profile/edit" variant="outline-primary">Edit Profile</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
