import { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const SERVICE_TYPES = [
  'Server Setup & Maintenance',
  'n8n Training & Education',
  'Workflow Development',
  'AI-Powered Agents',
  'Enterprise Solutions',
  'Ongoing Support & Consulting',
  'Other'
];

function ContactForm() {
  const [formData, setFormData] = useState({
    serviceType: '',
    serviceDescription: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { sendServiceRequest, user } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.serviceType) {
      setError('Please select a service type');
      return;
    }

    if (!formData.serviceDescription.trim()) {
      setError('Please describe the service you need');
      return;
    }

    if (formData.serviceDescription.trim().length < 20) {
      setError('Please provide a more detailed description (at least 20 characters)');
      return;
    }

    setLoading(true);

    try {
      const result = sendServiceRequest(formData.serviceDescription, formData.serviceType);
      if (result.success) {
        setSuccess(true);
        setFormData({
          serviceType: '',
          serviceDescription: ''
        });
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <Card.Title className="mb-4">
          <h4>Request a Service</h4>
          <p className="text-muted small mb-0">
            Fill out the form below to request our n8n consulting services. We'll get back to you shortly.
          </p>
        </Card.Title>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            <strong>Request sent successfully!</strong> Your service request has been sent. 
            We'll contact you at {user?.email} soon.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formServiceType">
            <Form.Label>Service Type <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
              <option value="">Select a service type</option>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formServiceDescription">
            <Form.Label>Service Description <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              name="serviceDescription"
              placeholder="Please describe your requirements, goals, timeline, and any specific needs..."
              value={formData.serviceDescription}
              onChange={handleChange}
              required
              minLength={20}
            />
            <Form.Text className="text-muted">
              Minimum 20 characters. Please provide as much detail as possible.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Text className="text-muted">
              <strong>Your details:</strong> {user?.username} ({user?.email})
              {user?.activitySector && ` - ${user.activitySector}`}
            </Form.Text>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={loading}
          >
            {loading ? 'Sending Request...' : 'Send Service Request'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ContactForm;

