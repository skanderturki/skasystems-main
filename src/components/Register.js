import { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const ACTIVITY_SECTORS = [
  'Technology & Software',
  'Finance & Banking',
  'Healthcare',
  'Education',
  'E-commerce & Retail',
  'Manufacturing',
  'Consulting & Services',
  'Real Estate',
  'Marketing & Advertising',
  'Transportation & Logistics',
  'Energy & Utilities',
  'Other'
];

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    activitySector: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [emailForOTP, setEmailForOTP] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.activitySector) {
      setError('Please select an activity sector');
      return;
    }

    setLoading(true);

    try {
      const result = register(
        formData.username,
        formData.email,
        formData.password,
        formData.activitySector
      );

      if (!result.success) {
        setError(result.error || 'Registration failed');
      } else {
        setEmailForOTP(formData.email);
        setStep('verify');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return <OTPVerification email={emailForOTP} />;
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <Card.Title className="text-center mb-4">
                <h3>Create Account</h3>
                <p className="text-muted small mb-0">Register to request our services</p>
              </Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    We'll send you an OTP code to verify your email
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formActivitySector">
                  <Form.Label>Activity Sector</Form.Label>
                  <Form.Select
                    name="activitySector"
                    value={formData.activitySector}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your activity sector</option>
                    {ACTIVITY_SECTORS.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Register'}
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Already have an account? <a href="#login">Login</a>
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

function OTPVerification({ email }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const result = verifyOTP(email, otp);
      if (!result.success) {
        setError(result.error || 'Verification failed');
      } else {
        // Redirect to login
        alert('Registration successful! Please login with your credentials.');
        window.location.hash = '#login';
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <Card.Title className="text-center mb-4">
                <h3>Verify Email</h3>
                <p className="text-muted small mb-0">Enter the OTP sent to {email}</p>
              </Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              <Alert variant="info" className="small">
                For testing: Check the browser console for the OTP code
              </Alert>
              <Form onSubmit={handleVerify}>
                <Form.Group className="mb-3" controlId="formOTP">
                  <Form.Label>OTP Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="text-center"
                    style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                  />
                  <Form.Text className="text-muted">
                    Check your email for the verification code
                  </Form.Text>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    <a href="#register" onClick={() => window.location.reload()}>
                      Back to registration
                    </a>
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;

