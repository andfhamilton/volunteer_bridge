import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import apiClient from '../../services/api';
import { AuthContext } from '../../context/AuthContext';


const OpportunityDetail = () => {
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [applicationNote, setApplicationNote] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await apiClient.get(`opportunities/${id}/`);
        setOpportunity(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching opportunity:', err);
        setError('Failed to load opportunity details. Please try again later.');
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  const handleApplyClick = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/opportunities/${id}` } });
      return;
    }

    setShowModal(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplying(true);
    
    try {
      await apiClient.post(`opportunities/${id}/apply/`, {
        note: applicationNote
      });
      setApplicationSuccess(true);
      setShowModal(false);
    } catch (err) {
      console.error('Error applying:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };
  
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`opportunities/${id}/`);
      navigate('/opportunities', { state: { message: 'Opportunity deleted successfully' } });
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      setError('Failed to delete opportunity. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!opportunity) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Opportunity not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {applicationSuccess && (
        <Alert variant="success" className="mb-4">
          Your application has been submitted successfully! The organization will contact you soon.
        </Alert>
      )}
      
      <Row>
        <Col lg={8}>
          <h1>{opportunity.title}</h1>
          <p className="lead">{opportunity.location}</p>
          
          <Card className="mb-4">
            <Card.Body>
              <h5>Description</h5>
              <p>{opportunity.description}</p>
              
              <h5>When</h5>
              <p>
                {new Date(opportunity.start_date).toLocaleDateString()} to{' '}
                {new Date(opportunity.end_date).toLocaleDateString()}
              </p>
              
              <h5>Required Skills</h5>
              <div className="mb-3">
                {opportunity.required_skills && opportunity.required_skills.length > 0 ? (
                  opportunity.required_skills.map((skill, index) => (
                    <Badge bg="secondary" className="me-2 mb-2" key={index}>
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p>No specific skills required.</p>
                )}
              </div>
              
              <h5>Category</h5>
              <Badge bg="info" className="mb-3">{opportunity.category || 'Uncategorized'}</Badge>
              
              <h5>Commitment</h5>
              <p>{opportunity.commitment_hours || 'Flexible'} hours per week</p>
            </Card.Body>
          </Card>
          
          {currentUser && currentUser.is_volunteer && (
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleApplyClick}
              disabled={applying || applicationSuccess}
            >
              {applicationSuccess ? 'Application Submitted' : 'Apply Now'}
            </Button>
          )}
          
          {!currentUser && (
            <Alert variant="info">
              Please <Alert.Link href="/login">log in</Alert.Link> to apply for this opportunity.
            </Alert>
          )}
          {currentUser && currentUser.is_organization && opportunity.organization_id === currentUser.id && (
            <div className="mt-3 d-flex gap-2">
              <Button 
                variant="outline-primary" 
                as={Link} 
                to={`/opportunities/edit/${opportunity.id}`}
              >
                Edit Opportunity
              </Button>
              <Button 
                variant="outline-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Opportunity
              </Button>
            </div>
          )}
          {currentUser && currentUser.is_organization && opportunity.organization_id === currentUser.id && (
            <Button 
              as={Link} 
              to={`/opportunities/${opportunity.id}/applications`} 
              variant="outline-primary"
              className="mt-3"
            >
              View Applications
            </Button>
          )}


        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <h5>Organization</h5>
              <p>{opportunity.organization_name || 'Organization information not available'}</p>
              
              <h5>Status</h5>
              <Badge bg={opportunity.status === 'OPEN' ? 'success' : 'secondary'}>
                {opportunity.status}
              </Badge>
              
              <h5 className="mt-3">Spots Available</h5>
              <p>{opportunity.max_volunteers || 'Unlimited'}</p>
              
              <h5 className="mt-3">Location</h5>
              <p>{opportunity.location}</p>
              
              {opportunity.virtual && (
                <Badge bg="success" className="mt-2">Virtual Opportunity</Badge>
              )}
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <h5>Share This Opportunity</h5>
              <div className="d-flex justify-content-around mt-3">
                <Button variant="outline-primary" size="sm">Facebook</Button>
                <Button variant="outline-info" size="sm">Twitter</Button>
                <Button variant="outline-secondary" size="sm">Email</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Application Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Apply for {opportunity.title}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleApplySubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Why are you interested in this opportunity?</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={applicationNote}
                onChange={(e) => setApplicationNote(e.target.value)}
                placeholder="Tell the organization why you're a good fit..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={applying}>
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this opportunity? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Opportunity'}
            </Button>
          </Modal.Footer>
        </Modal>
   
    </Container>
  );
};

export default OpportunityDetail;
