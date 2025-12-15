
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import ContactForm from './ContactForm';

function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section py-5 mb-5">
        <Row className="align-items-center">
          <Col md={8} className="mx-auto text-center">
            <h1 className="display-4 fw-bold mb-4">
              Professional n8n Consulting Services
            </h1>
            <p className="lead mb-4">
              Transform your business processes with expert n8n workflow automation. 
              From server setup to AI-powered agents, we help you unlock the full potential of n8n.
            </p>
            <Button variant="primary" size="lg" href="#contact" className="me-3">
              Get Started
            </Button>
            <Button variant="outline-primary" size="lg" href="#services" className="me-3">
              Our Services
            </Button>
            <Button variant="outline-secondary" size="lg" href="#portfolio">
              View Portfolio
            </Button>
          </Col>
        </Row>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section py-5 mb-5">
        <Row>
          <Col className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Our Services</h2>
            <p className="lead text-muted">
              Comprehensive n8n solutions tailored to your business needs
            </p>
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <Badge bg="primary" className="mb-2">Setup & Maintenance</Badge>
                </div>
                <Card.Title className="h4 mb-3">Server Setup & Maintenance</Card.Title>
                <Card.Text className="text-muted">
                  Professional n8n server installation, configuration, and ongoing maintenance. 
                  We handle updates, security patches, and ensure your n8n instance runs smoothly 
                  and efficiently.
                </Card.Text>
                <ul className="list-unstyled mt-3">
                  <li className="mb-2">✓ Server installation & configuration</li>
                  <li className="mb-2">✓ Regular updates & security patches</li>
                  <li className="mb-2">✓ Performance optimization</li>
                  <li className="mb-2">✓ Backup & disaster recovery</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <Badge bg="success" className="mb-2">Training</Badge>
                </div>
                <Card.Title className="h4 mb-3">n8n Training & Education</Card.Title>
                <Card.Text className="text-muted">
                  Comprehensive training programs for individuals and teams. Learn to build 
                  powerful workflows, understand n8n's capabilities, and become self-sufficient 
                  in workflow automation.
                </Card.Text>
                <ul className="list-unstyled mt-3">
                  <li className="mb-2">✓ Beginner to advanced courses</li>
                  <li className="mb-2">✓ Team training sessions</li>
                  <li className="mb-2">✓ Custom curriculum development</li>
                  <li className="mb-2">✓ Hands-on workshops</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <Badge bg="info" className="mb-2">Development</Badge>
                </div>
                <Card.Title className="h4 mb-3">Workflow Development</Card.Title>
                <Card.Text className="text-muted">
                  Custom workflow development for individuals and companies. We design and 
                  implement automated processes that streamline your operations, integrate 
                  your tools, and save time and resources.
                </Card.Text>
                <ul className="list-unstyled mt-3">
                  <li className="mb-2">✓ Custom workflow design</li>
                  <li className="mb-2">✓ API integrations</li>
                  <li className="mb-2">✓ Data transformation & processing</li>
                  <li className="mb-2">✓ Workflow optimization</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <Badge bg="warning" className="mb-2">AI Agents</Badge>
                </div>
                <Card.Title className="h4 mb-3">AI-Powered Agents</Card.Title>
                <Card.Text className="text-muted">
                  Build intelligent AI agents queryable via HTTP requests. Leverage n8n's 
                  advanced AI capabilities to create chatbots, assistants, and automated 
                  decision-making systems.
                </Card.Text>
                <ul className="list-unstyled mt-3">
                  <li className="mb-2">✓ HTTP-queryable AI agents</li>
                  <li className="mb-2">✓ LangChain integration</li>
                  <li className="mb-2">✓ RAG (Retrieval-Augmented Generation)</li>
                  <li className="mb-2">✓ Custom AI workflows</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <Badge bg="danger" className="mb-2">Enterprise</Badge>
                </div>
                <Card.Title className="h4 mb-3">Enterprise Solutions</Card.Title>
                <Card.Text className="text-muted">
                  Scalable n8n solutions for enterprise needs. From multi-environment setups 
                  to source control integration, we help large organizations implement n8n 
                  at scale.
                </Card.Text>
                <ul className="list-unstyled mt-3">
                  <li className="mb-2">✓ Multi-environment deployments</li>
                  <li className="mb-2">✓ Source control integration</li>
                  <li className="mb-2">✓ High availability setups</li>
                  <li className="mb-2">✓ Enterprise security & compliance</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <Badge bg="secondary" className="mb-2">Support</Badge>
                </div>
                <Card.Title className="h4 mb-3">Ongoing Support & Consulting</Card.Title>
                <Card.Text className="text-muted">
                  Continuous support for your n8n infrastructure. Get expert advice, 
                  troubleshooting, and optimization services to keep your workflows running 
                  at peak performance.
                </Card.Text>
                <ul className="list-unstyled mt-3">
                  <li className="mb-2">✓ 24/7 monitoring & support</li>
                  <li className="mb-2">✓ Troubleshooting & debugging</li>
                  <li className="mb-2">✓ Performance tuning</li>
                  <li className="mb-2">✓ Best practices consulting</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section py-5 mb-5 bg-light">
        <Row>
          <Col className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Why Choose Us</h2>
            <p className="lead text-muted">
              Expert n8n consultants with proven track record
            </p>
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={4}>
            <div className="text-center">
              <div className="mb-3">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 2.384 6.323a.75.75 0 0 0-1.06 1.061l5.5 5.5a.75.75 0 0 0 1.07-.01l4-4.5a.75.75 0 0 0-.924-1.064z"/>
                </svg>
              </div>
              <h4 className="fw-bold">Deep Expertise</h4>
              <p className="text-muted">
                Extensive experience with n8n's full feature set, from basic workflows 
                to advanced AI integrations and enterprise deployments.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="text-center">
              <div className="mb-3">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
              </div>
              <h4 className="fw-bold">Custom Solutions</h4>
              <p className="text-muted">
                Tailored solutions that fit your specific business needs. We don't believe 
                in one-size-fits-all approaches.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="text-center">
              <div className="mb-3">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </svg>
              </div>
              <h4 className="fw-bold">Proven Results</h4>
              <p className="text-muted">
                Track record of successful implementations that save time, reduce costs, 
                and improve business processes for our clients.
              </p>
            </div>
          </Col>
        </Row>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section py-5 mb-5">
        <Row>
          <Col md={10} className="mx-auto">
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold mb-3">Ready to Get Started?</h2>
              {isAuthenticated ? (
                <p className="lead text-muted">
                  Request our n8n consulting services. Fill out the form below and we'll get back to you.
                </p>
              ) : (
                <p className="lead text-muted">
                  Let's discuss how n8n can transform your business processes. 
                  <a href="#register" className="ms-2">Register</a> or <a href="#login">login</a> to request our services.
                </p>
              )}
            </div>
            
            {isAuthenticated ? (
              <ContactForm />
            ) : (
              <div className="text-center">
                <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                  <Button variant="primary" size="lg" href="#register">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    Register Now
                  </Button>
                  <Button variant="outline-primary" size="lg" href="#login">
                    Login
                  </Button>
                  <Button variant="outline-secondary" size="lg" href="https://n8n.skasystems.com" target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                      <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/>
                    </svg>
                    Try n8n
                  </Button>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </section>
    </div>
  );
}

export default Home;