import React, { useContext, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [message] = useState('');

  if (!currentUser) {
    return <div>Loading profile...</div>;
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
