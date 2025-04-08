import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import AuthService from '../../services/auth.service';

const AppNavbar = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <Navbar expand="lg">
      <Container>
        
        <Navbar.Brand as={Link} to="/">
          <img
            src="/images/volunteer-icon.png"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
            alt="Volunteer Bridge logo"
          />
          Volunteer Bridge
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/opportunities">Opportunities</Nav.Link>
            <Nav.Link as={Link} to="/events">Events</Nav.Link>
          </Nav>
          <Nav>
            {currentUser ? (
              <>
              <Nav.Link as={Link} to="/profile">
              My Profile
              </Nav.Link>
                <Nav.Link as={Link} to="/notifications">
                  Notifications
                </Nav.Link>
                <NavDropdown title={currentUser.username} id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  {currentUser.is_volunteer && (
                    <NavDropdown.Item as={Link} to="/volunteer-hours">My Hours</NavDropdown.Item>
                  )}
                  {currentUser.is_organization && (
                    <NavDropdown.Item as={Link} to="/organization-dashboard">Dashboard</NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
              
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
