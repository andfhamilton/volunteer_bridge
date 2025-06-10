import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';




const OpportunityList = () => {
  // Inside the component:
  const { currentUser } = useContext(AuthContext);
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Categories for filtering
  const categories = ['Education', 'Environment', 'Health', 'Animals', 'Arts', 
                     'Community Development', 'Disaster Relief', 'Human Rights'];

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await apiClient.get('opportunities/');
        setOpportunities(response.data);
        setFilteredOpportunities(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities. Please try again later.');
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // Filter opportunities based on search term and category
  useEffect(() => {
    if (opportunities.length > 0) {
      let filtered = opportunities;
      
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(opp => 
          opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          opp.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filter by category
      if (categoryFilter) {
        filtered = filtered.filter(opp => 
          opp.category === categoryFilter
        );
      }
      
      setFilteredOpportunities(filtered);
    }
  }, [searchTerm, categoryFilter, opportunities]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
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

  return (
    
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
      <h1>Volunteer Opportunities</h1>
      
      {currentUser && currentUser.is_organization && (
        <Button 
          as={Link} 
          to="/opportunities/create" 
          variant="primary"
        >
          Create Opportunity
        </Button>
      )}
    </div>

      {/* Search and Filter Section */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
              Clear
            </Button>
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select 
            value={categoryFilter} 
            onChange={handleCategoryChange}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      
      {filteredOpportunities.length === 0 ? (
        <Alert variant="info">
          {searchTerm || categoryFilter ? 
            "No opportunities match your search criteria." : 
            "No opportunities available at this time."}
        </Alert>
      ) : (
        <Row>
          {filteredOpportunities.map((opportunity) => (
            <Col md={4} className="mb-4" key={opportunity.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{opportunity.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {opportunity.location}
                  </Card.Subtitle>
                  <Card.Text>
                    {opportunity.description.length > 100
                      ? `${opportunity.description.substring(0, 100)}...`
                      : opportunity.description}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {new Date(opportunity.start_date).toLocaleDateString()} to{' '}
                      {new Date(opportunity.end_date).toLocaleDateString()}
                    </small>
                    <Button
                      as={Link}
                      to={`/opportunities/${opportunity.id}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default OpportunityList;
