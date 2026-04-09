import { useState } from 'react';
import { UserPlus, AlertTriangle, Info, MailCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from '../lib/utils';

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
  'Other',
];

const selectClass = cn(
  'flex h-11 w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-primary',
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1 L6 6 L11 1'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_1rem_center] pr-10"
);

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    activitySector: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [emailForOTP, setEmailForOTP] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

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
    <section className="relative bg-mesh-dark min-h-[calc(100vh-13rem)] flex items-center">
      <div className="absolute inset-0 grid-overlay opacity-30" aria-hidden="true" />
      <div className="container-page relative py-16">
        <div className="mx-auto max-w-lg">
          <div className="relative">
            <div
              className="absolute -inset-2 rounded-[28px] bg-gradient-to-r from-brand-blue/30 via-brand-cyan/20 to-brand-violet/30 blur-2xl opacity-70"
              aria-hidden="true"
            />
            <div className="relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue/30 to-brand-violet/30 border border-white/10 mb-4">
                  <UserPlus className="h-6 w-6 text-brand-cyan" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Create Account</h2>
                <p className="text-sm text-white/60 mt-1">
                  Register to request our services
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="regUsername" className="text-white/90">Username</Label>
                  <Input
                    id="regUsername"
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regEmail" className="text-white/90">Email address</Label>
                  <Input
                    id="regEmail"
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <p className="text-xs text-white/40">
                    We'll send you an OTP code to verify your email
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="regPassword" className="text-white/90">Password</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      name="password"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regConfirm" className="text-white/90">Confirm</Label>
                    <Input
                      id="regConfirm"
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regSector" className="text-white/90">Activity Sector</Label>
                  <select
                    id="regSector"
                    name="activitySector"
                    value={formData.activitySector}
                    onChange={handleChange}
                    required
                    className={selectClass}
                  >
                    <option value="" className="bg-brand-deep text-white/70">
                      Select your activity sector
                    </option>
                    {ACTIVITY_SECTORS.map((sector) => (
                      <option key={sector} value={sector} className="bg-brand-deep text-white">
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : 'Register'}
                </Button>

                <p className="text-center text-sm text-white/60">
                  Already have an account?{' '}
                  <a href="#login" className="text-brand-cyan hover:text-brand-glow transition">
                    Login
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
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
    <section className="relative bg-mesh-dark min-h-[calc(100vh-13rem)] flex items-center">
      <div className="absolute inset-0 grid-overlay opacity-30" aria-hidden="true" />
      <div className="container-page relative py-16">
        <div className="mx-auto max-w-md">
          <div className="relative">
            <div
              className="absolute -inset-2 rounded-[28px] bg-gradient-to-r from-brand-blue/30 via-brand-cyan/20 to-brand-violet/30 blur-2xl opacity-70"
              aria-hidden="true"
            />
            <div className="relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue/30 to-brand-violet/30 border border-white/10 mb-4">
                  <MailCheck className="h-6 w-6 text-brand-cyan" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Verify Email</h2>
                <p className="text-sm text-white/60 mt-1">Enter the OTP sent to {email}</p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert variant="info" className="mb-5">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  For testing: Check the browser console for the OTP code
                </AlertDescription>
              </Alert>

              <form onSubmit={handleVerify} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otpCode" className="text-white/90">OTP Code</Label>
                  <Input
                    id="otpCode"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 text-center text-2xl tracking-[0.5em] h-14"
                  />
                  <p className="text-xs text-white/40">
                    Check your email for the verification code
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="brand"
                  size="lg"
                  className="w-full"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>

                <p className="text-center text-sm text-white/60">
                  <a
                    href="#register"
                    onClick={() => window.location.reload()}
                    className="text-brand-cyan hover:text-brand-glow transition"
                  >
                    Back to registration
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
