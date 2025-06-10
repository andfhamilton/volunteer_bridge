import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const OpportunityForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'OPEN',
    max_volunteers: '',
    commitment_hours: '',
    required_skills: [],
    category: '',
    virtual: false
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  
  // Categories for dropdown
  const categories = [
    { value: 'EDU', label: 'Education' },
    { value: 'ENV', label: 'Environment' },
    { value: 'HEA', label: 'Health' },
    { value: 'ANI', label: 'Animals' },
    { value: 'ART', label: 'Arts' },
    { value: 'COM', label: 'Community Development' },
    { value: 'DRE', label: 'Disaster Relief' },
    { value: 'HUM', label: 'Human Rights' },
    { value: 'OTH', label: 'Other' }

];
  
  useEffect(() => {
    // If editing, fetch the opportunity data
    if (isEditing) {
      const fetchOpportunity = async () => {
        try {
          const response = await apiClient.get(`opportunities/${id}/`);
          setFormData(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching opportunity:', err);
          setError('Failed to load opportunity. Please try again.');
          setLoading(false);
        }
      };
      
      fetchOpportunity();
    }
  }, [id, isEditing]);
  
  // Check if user is authorized (is an organization)
  useEffect(() => {
    if (currentUser && !currentUser.is_organization) {
      setError('Only organizations can create or edit opportunities.');
    }
  }, [currentUser]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleAddSkill = () => {
    if (skillInput && !formData.required_skills.includes(skillInput)) {
      setFormData({
        ...formData,
        required_skills: [...formData.required_skills, skillInput]
      });
      setSkillInput('');
    }
  };
  
  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      required_skills: formData.required_skills.filter(skill => skill !== skillToRemove)
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
     // Format dates for Django
    const submitData = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    };
    
    try {
      if (isEditing) {
        await apiClient.put(`opportunities/${id}/`, submitData);
      } else {
        await apiClient.post('opportunities/', submitData);
      }
      
      setSuccess(true);
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/opportunities');
      }, 2000);
    } catch (err) {
      console.error('Error saving opportunity:', err);
      setError('Failed to save opportunity. Please check your inputs and try again.');
    }
  };
  
  if (loading) {
    return <Container className="my-5"><p>Loading...</p></Container>;
  }
  
  if (currentUser && !currentUser.is_organization) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          Only organizations can create or edit opportunities.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="my-5">
      <Card>
        <Card.Body>
          <h1 className="mb-4">{isEditing ? 'Edit Opportunity' : 'Create New Opportunity'}</h1>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">
              Opportunity {isEditing ? 'updated' : 'created'} successfully!
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="This is a virtual opportunity"
                    name="virtual"
                    checked={formData.virtual}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                    <option value="FILLED">Filled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Maximum Volunteers</Form.Label>
                  <Form.Control
                    type="number"
                    name="max_volunteers"
                    value={formData.max_volunteers}
                    onChange={handleChange}
                    min="1"
                  />
                  <Form.Text className="text-muted">
                    Leave blank for unlimited
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Weekly Commitment (hours)</Form.Label>
              <Form.Control
                type="number"
                name="commitment_hours"
                value={formData.commitment_hours}
                onChange={handleChange}
                min="1"
              />
              <Form.Text className="text-muted">
                Approximate hours per week
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Required Skills</Form.Label>
              <Row>
                <Col md={9}>
                  <Form.Control
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Enter a skill"
                  />
                </Col>
                <Col md={3}>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleAddSkill}
                    className="w-100"
                  >
                    Add Skill
                  </Button>
                </Col>
              </Row>
              
              <div className="mt-2">
                {formData.required_skills.length > 0 ? (
                  formData.required_skills.map((skill, index) => (
                    <Badge 
                      bg="secondary" 
                      className="me-2 mb-2 p-2" 
                      key={index}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted">No skills added yet</p>
                )}
              </div>
              <Form.Text className="text-muted">
                Click on a skill to remove it
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/opportunities')}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update Opportunity' : 'Create Opportunity'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OpportunityForm;
// This code is a React component for creating or editing volunteer opportunities.