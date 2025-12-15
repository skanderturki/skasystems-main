
import './App.css';
import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Button, Alert,
  Nav, Navbar, NavDropdown, Breadcrumb, Card, Form
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Portfolio from "./components/Portfolio";
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, logout } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    // Handle hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      setCurrentView(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentView('home');
    window.location.hash = '#home';
  };

  return (
    <div className="App w-100">
      <header className="App-header w-100">
        <div className="banner-background">
          <Container className="w-100">
            <div className="banner-content">
              <div className="banner-branding">
                <div className="brand-logo">
                  <div className="logo-container">
                    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
                      {/* Neural Network / Brain-inspired Logo */}
                      <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                          <stop offset="100%" stopColor="#e3f2fd" stopOpacity="0.9" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      
                      {/* Outer circle with tech pattern */}
                      <circle cx="36" cy="36" r="34" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1"/>
                      
                      {/* Neural network nodes */}
                      <circle cx="20" cy="20" r="4" fill="white" opacity="0.9" filter="url(#glow)"/>
                      <circle cx="52" cy="20" r="4" fill="white" opacity="0.9" filter="url(#glow)"/>
                      <circle cx="20" cy="52" r="4" fill="white" opacity="0.9" filter="url(#glow)"/>
                      <circle cx="52" cy="52" r="4" fill="white" opacity="0.9" filter="url(#glow)"/>
                      <circle cx="36" cy="36" r="5" fill="url(#logoGradient)" filter="url(#glow)"/>
                      <circle cx="28" cy="28" r="3" fill="white" opacity="0.7"/>
                      <circle cx="44" cy="28" r="3" fill="white" opacity="0.7"/>
                      <circle cx="28" cy="44" r="3" fill="white" opacity="0.7"/>
                      <circle cx="44" cy="44" r="3" fill="white" opacity="0.7"/>
                      
                      {/* Connections - Neural network */}
                      <path d="M20 20 L28 28 M28 28 L36 36 M36 36 L44 28 M44 28 L52 20" 
                            stroke="white" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
                      <path d="M20 52 L28 44 M28 44 L36 36 M36 36 L44 44 M44 44 L52 52" 
                            stroke="white" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
                      <path d="M20 20 L28 28 M52 20 L44 28 M20 52 L28 44 M52 52 L44 44" 
                            stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
                      
                      {/* Data flow arrows */}
                      <path d="M32 32 L36 36 L32 40" stroke="white" strokeWidth="2" fill="none" opacity="0.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M40 32 L36 36 L40 40" stroke="white" strokeWidth="2" fill="none" opacity="0.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="brand-text">
                    <h1 className="brand-title">FoxTrek Systems</h1>
                    <p className="brand-tagline">n8n Consulting Services</p>
                  </div>
                </div>
                <div className="brand-features">
                  <div className="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <span>Expert Solutions</span>
                  </div>
                  <div className="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      <path d="M9 12l2 2 4-4"></path>
                    </svg>
                    <span>Trusted Partner</span>
                  </div>
                  <div className="feature-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    <span>Custom Solutions</span>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
        <div className="navbar-container">
          <Container className="w-100">
            <Navbar expand="lg" className="w-100">
              <Container>
                <Navbar.Brand href="#home" className="d-flex align-items-center">
                  <img
                    src="/images/site/html-black.svg"
                    width="28"
                    height="28"
                    className="d-inline-block align-top me-2"
                    alt="n8n Consulting"
                  />
                  <span className="fw-bold">FoxTrek Systems</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="me-auto">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="#services">Services</Nav.Link>
                    <Nav.Link href="#portfolio">Portfolio</Nav.Link>
                    <Nav.Link href="#contact">Contact</Nav.Link>
                    {isAuthenticated ? (
                      <>
                        <Nav.Link href="https://n8n.skasystems.com" target="_blank" rel="noopener noreferrer">
                          My n8n server
                        </Nav.Link>
                        <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
                          Logout
                        </Nav.Link>
                      </>
                    ) : (
                      <>
                        <Nav.Link href="#login">Login</Nav.Link>
                        <Nav.Link href="#register">Register</Nav.Link>
                      </>
                    )}
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          </Container>
        </div>

      </header>
      <main>
        <Container>
          {currentView === 'login' ? <Login /> : 
           currentView === 'register' ? <Register /> : 
           currentView === 'portfolio' ? <Portfolio /> :
           <Home />}
        </Container>
      </main>
      <footer>
        <Container>
          <Row>
            <Col className="m-3 text-center">
              <p className="mb-2">© 2025 SKA Systems - n8n Consulting Services</p>
              <p className="mb-2">
                <a href="mailto:skanderturki@gmail.com" className="text-decoration-none">Contact Us</a>
                {' | '}
                <a href="https://docs.n8n.io/" target="_blank" rel="noopener noreferrer" className="text-decoration-none">n8n Documentation</a>
              </p>
            </Col>
            {/* <Col className="m-3">
              <Form>
                <Form.Group controlId="formEmail">
                  <Form.Label>Email address:</Form.Label>
                  <Form.Control type="email" placeholder="example@email.com"></Form.Control>
                  <Form.Text className="text-warning" >We'll never share your email</Form.Text>
                </Form.Group>

                <Button variant="secondary" type="submit">Request contact</Button>
              </Form>
            </Col> */}
          </Row>

        </Container>

      </footer>
    </div>
  );
}

export default App;
