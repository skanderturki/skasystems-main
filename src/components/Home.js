import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import ContactForm from './ContactForm';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section py-5 mb-5">
        <Row className="align-items-center">
          <Col md={10} lg={8} className="mx-auto text-center">
            <h1 className="display-4 fw-bold mb-4">
              Intelligent Software Solutions for Education and Academia
            </h1>
            <p className="lead mb-4">
              SKA Systems builds personalized learning platforms, academic automation workflows,
              and AI-powered advising tools that help institutions and professionals
              teach, train and support learners at scale.
            </p>
            <Button variant="primary" size="lg" href="#services" className="me-3">
              Explore Our Services
            </Button>
            <Button variant="outline-primary" size="lg" href="#contact">
              Get in Touch
            </Button>
          </Col>
        </Row>
      </section>

      {/* About / Identity Section */}
      <section id="about" className="about-section py-5 mb-5">
        <Row>
          <Col md={10} className="mx-auto text-center">
            <h2 className="display-5 fw-bold mb-3">Who We Are</h2>
            <p className="lead text-muted mb-4">
              SKA Systems is an independent software studio focused on the intersection of
              education, automation, and applied AI. We design and deliver custom solutions
              that turn course content, internal know-how, and manual processes into
              scalable digital products.
            </p>
            <p className="text-muted">
              From personalized learning platforms with verifiable certificates
              to AI chatbots grounded in your own documentation,
              we help universities, training organizations and subject-matter experts
              bring their expertise online — without the overhead of a large dev team.
            </p>
          </Col>
        </Row>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section py-5 mb-5">
        <Row>
          <Col className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">What We Build</h2>
            <p className="lead text-muted">
              Three core offerings, each delivered as a tailored solution for your domain
            </p>
          </Col>
        </Row>
        <Row className="g-4">
          {/* Service 1: Personalized Learning Platforms */}
          <Col md={12} lg={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4 d-flex flex-column">
                <div className="mb-3">
                  <Badge bg="primary" className="mb-2">Learning Platforms</Badge>
                </div>
                <Card.Title className="h4 mb-3">Personalized Education &amp; Training Websites</Card.Title>
                <Card.Text className="text-muted">
                  Full-featured learning platforms with personalized course content,
                  practice exams, timed assessments, and verifiable certificates.
                  Perfect for professional certification prep, corporate training,
                  or university-branded online courses.
                </Card.Text>
                <ul className="list-unstyled mt-3 mb-4">
                  <li className="mb-2">✓ Custom curriculum &amp; content modeling</li>
                  <li className="mb-2">✓ Practice tests with detailed feedback</li>
                  <li className="mb-2">✓ Proctored-style exams &amp; scoring</li>
                  <li className="mb-2">✓ PDF certificates with public verification</li>
                  <li className="mb-2">✓ Student dashboards &amp; progress tracking</li>
                </ul>
                <div className="mt-auto">
                  <Button
                    variant="outline-primary"
                    href="https://pmp.skasystems.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    See Live Example: PMP Platform →
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Service 2: Academic Automation */}
          <Col md={12} lg={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4 d-flex flex-column">
                <div className="mb-3">
                  <Badge bg="success" className="mb-2">Academic Automation</Badge>
                </div>
                <Card.Title className="h4 mb-3">Automation Workflows for Academia</Card.Title>
                <Card.Text className="text-muted">
                  Replace repetitive administrative work with custom workflows built on
                  self-hosted n8n. We integrate with your LMS, email, spreadsheets,
                  and databases to automate admissions, grading pipelines,
                  reporting and communication.
                </Card.Text>
                <ul className="list-unstyled mt-3 mb-4">
                  <li className="mb-2">✓ Self-hosted n8n server setup</li>
                  <li className="mb-2">✓ LMS &amp; SIS integrations</li>
                  <li className="mb-2">✓ Automated emails, notifications, reports</li>
                  <li className="mb-2">✓ Document generation (certificates, transcripts)</li>
                  <li className="mb-2">✓ AI-assisted content and grading workflows</li>
                </ul>
                <div className="mt-auto">
                  <Button
                    variant="outline-success"
                    href="https://n8n.skasystems.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explore Our n8n Server →
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Service 3: AI Student Advisors */}
          <Col md={12} lg={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4 d-flex flex-column">
                <div className="mb-3">
                  <Badge bg="info" className="mb-2">AI Advisors</Badge>
                  <Badge bg="secondary" className="mb-2 ms-2">Coming Soon</Badge>
                </div>
                <Card.Title className="h4 mb-3">AI-Powered Student Advising</Card.Title>
                <Card.Text className="text-muted">
                  Student advising websites powered by AI chatbots that answer questions
                  grounded in your own documentation — course catalogs, regulations,
                  FAQs and internal guides. Students get accurate, personalized help
                  around the clock; staff get their time back.
                </Card.Text>
                <ul className="list-unstyled mt-3 mb-4">
                  <li className="mb-2">✓ Chatbot grounded in your documents (RAG)</li>
                  <li className="mb-2">✓ Personalized per student profile</li>
                  <li className="mb-2">✓ Escalation to human advisors</li>
                  <li className="mb-2">✓ Analytics on student questions &amp; gaps</li>
                  <li className="mb-2">✓ Configurable tone &amp; policy guardrails</li>
                </ul>
                <div className="mt-auto">
                  <Button variant="outline-info" href="#contact">
                    Request Early Access →
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section py-5 mb-5 bg-light">
        <Row>
          <Col className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Why SKA Systems</h2>
            <p className="lead text-muted">
              A small, hands-on team with a strong focus on education technology
            </p>
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={4}>
            <div className="text-center">
              <div className="mb-3">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/>
                  <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/>
                </svg>
              </div>
              <h4 className="fw-bold">Education-First Expertise</h4>
              <p className="text-muted">
                Built on hands-on experience with curriculum design, assessment,
                and academic workflows — not generic templates retrofitted for schools.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="text-center">
              <div className="mb-3">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
              </div>
              <h4 className="fw-bold">End-to-End Delivery</h4>
              <p className="text-muted">
                We handle architecture, development, deployment and hosting.
                You get a working platform on your own domain, not a pile of code.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="text-center">
              <div className="mb-3">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                  <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216Z"/>
                  <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                </svg>
              </div>
              <h4 className="fw-bold">Direct &amp; Responsive</h4>
              <p className="text-muted">
                You work directly with the people building your product.
                No account managers, no hand-offs, no surprises.
              </p>
            </div>
          </Col>
        </Row>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section py-5 mb-5">
        <Row>
          <Col md={10} lg={8} className="mx-auto">
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold mb-3">Let's Talk About Your Project</h2>
              <p className="lead text-muted">
                Tell us what you want to build or automate — we'll get back to you.
              </p>
            </div>
            <ContactForm />
          </Col>
        </Row>
      </section>
    </div>
  );
}

export default Home;
