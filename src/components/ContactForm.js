import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';

const SERVICE_TYPES = [
  'Personalized Learning Platform',
  'Academic Automation (n8n)',
  'AI Student Advisor',
  'Other / Not sure yet',
];

const CONTACT_EMAIL = 'skanderturki@gmail.com';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    serviceType: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Please enter your name';
    if (!formData.email.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (!formData.serviceType) return 'Please select a service type';
    if (!formData.message.trim() || formData.message.trim().length < 20) {
      return 'Please provide a more detailed message (at least 20 characters)';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      setSuccess(true);
      setFormData({ name: '', email: '', organization: '', serviceType: '', message: '' });
    } catch (err) {
      setError(err.message || 'Could not send your message. Please try emailing us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <Card.Title className="mb-4">
          <h4>Send Us a Message</h4>
          <p className="text-muted small mb-0">
            Or reach us directly at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-decoration-none">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Card.Title>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            <strong>Thanks!</strong> Your message has been sent. We'll get back to you soon.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Name <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formOrganization">
            <Form.Label>Organization</Form.Label>
            <Form.Control
              type="text"
              name="organization"
              placeholder="University, company or team (optional)"
              value={formData.organization}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formServiceType">
            <Form.Label>Service of Interest <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
              <option value="">Select a service</option>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formMessage">
            <Form.Label>Message <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              name="message"
              placeholder="Tell us about your project, goals, timeline, and anything else we should know..."
              value={formData.message}
              onChange={handleChange}
              required
              minLength={20}
            />
            <Form.Text className="text-muted">
              Minimum 20 characters.
            </Form.Text>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ContactForm;
