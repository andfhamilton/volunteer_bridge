// src/components/opportunities/ApplicationList.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const ApplicationList = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [opportunity, setOpportunity] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
        try {
          // Fetch opportunity details
          const opportunityResponse = await apiClient.get(`opportunities/${id}/`);
          setOpportunity(opportunityResponse.data);
          
          // Fetch applications
          const applicationsResponse = await apiClient.get(`opportunities/${id}/applications/`);
          setApplications(applicationsResponse.data);
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load data. Please try again later.');
          setLoading(false);
        }
      };
      
      fetchData();
    }, [id]);
  
  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };
  
  const handleUpdateStatus = async (applicationId, newStatus) => {
    setProcessingAction(true);
    try {
      const response = await apiClient.patch(`applications/${applicationId}/`, {
        status: newStatus
      });
      
      // Update the application in the list
      setApplications(applications.map(app => 
        app.id === applicationId ? response.data : app
      ));
      
      // Close modal if open
      if (showModal) {
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application status. Please try again.');
    } finally {
      setProcessingAction(false);
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
  
  if (!currentUser || !currentUser.is_organization) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          Only organizations can view applications.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="my-5">
      <h1 className="mb-4">Applications for {opportunity?.title || 'Opportunity'}</h1>
      
      {applications.length === 0 ? (
        <Alert variant="info">
          No applications have been submitted for this opportunity yet.
        </Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Volunteer</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(application => (
              <tr key={application.id}>
                <td>{application.volunteer_name}</td>
                <td>{new Date(application.created_at).toLocaleDateString()}</td>
                <td>
                  <Badge bg={
                    application.status === 'PENDING' ? 'warning' :
                    application.status === 'APPROVED' ? 'success' :
                    application.status === 'REJECTED' ? 'danger' :
                    'secondary'
                  }>
                    {application.status}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleViewDetails(application)}
                  >
                    View Details
                  </Button>
                  
                  {application.status === 'PENDING' && (
                    <>
                      <Button 
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleUpdateStatus(application.id, 'APPROVED')}
                        disabled={processingAction}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleUpdateStatus(application.id, 'REJECTED')}
                        disabled={processingAction}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Application Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <div>
              <h5>Volunteer Information</h5>
              <p><strong>Name:</strong> {selectedApplication.volunteer_name}</p>
              <p><strong>Email:</strong> {selectedApplication.volunteer_email}</p>
              <p><strong>Applied On:</strong> {new Date(selectedApplication.created_at).toLocaleString()}</p>
              
              <h5 className="mt-4">Application Note</h5>
              <p>{selectedApplication.note || 'No note provided.'}</p>
              
              <h5 className="mt-4">Status</h5>
              <Badge bg={
                selectedApplication.status === 'PENDING' ? 'warning' :
                selectedApplication.status === 'APPROVED' ? 'success' :
                selectedApplication.status === 'REJECTED' ? 'danger' :
                'secondary'
              } className="p-2">
                {selectedApplication.status}
              </Badge>
              
              {selectedApplication.status === 'PENDING' && (
                <div className="mt-4">
                  <h5>Actions</h5>
                  <Button 
                    variant="success"
                    className="me-2"
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'APPROVED')}
                    disabled={processingAction}
                  >
                    Approve Application
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'REJECTED')}
                    disabled={processingAction}
                  >
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ApplicationList;
