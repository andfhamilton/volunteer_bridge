import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';

// Shared components
import AppNavbar from './components/shared/NavBar';
import Footer from './components/shared/Footer';

// Import styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom-styles.css';  
import 'bootstrap/dist/js/bootstrap.bundle.min.js';



// Page components
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OpportunityList from './components/opportunities/OpportunityList';
import OpportunityDetail from './components/opportunities/OpportunityDetail';
import PrivateRoute from './components/routing/PrivateRoute';


// Placeholder components (we'll create these next)
const Events = () => <div>Events Page</div>;
const Profile = () => <div>Profile Page</div>;
const NotFound = () => <div>404 - Page Not Found</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <AppNavbar />
          <Container className="flex-grow-1 py-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/opportunities" element={<OpportunityList />} />
              <Route path="/opportunities/:id" element={<OpportunityDetail />} />
              <Route path="/events" element={<Events />} />
              
              {/* Protected routes */}
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
