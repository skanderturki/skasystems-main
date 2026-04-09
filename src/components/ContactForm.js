import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Send, Mail } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from '../lib/utils';

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

  const selectClass = cn(
    'flex h-11 w-full appearance-none rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-primary',
    "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1 L6 6 L11 1'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_1rem_center] pr-10",
    !formData.serviceType && 'text-muted-foreground'
  );

  return (
    <div className="relative">
      {/* Glow aura behind the card */}
      <div
        className="absolute -inset-2 rounded-[28px] bg-gradient-to-r from-brand-blue/30 via-brand-cyan/20 to-brand-violet/30 blur-2xl opacity-70"
        aria-hidden="true"
      />

      <div className="relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-white">Send Us a Message</h3>
          <p className="text-sm text-white/60 mt-1">
            Or reach us directly at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1 text-brand-cyan hover:text-brand-glow transition"
            >
              <Mail className="h-3.5 w-3.5" />
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-5">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Thanks!</strong> Your message has been sent. We'll get back to you soon.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="formName" className="text-white/90">
                Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="formName"
                type="text"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formEmail" className="text-white/90">
                Email <span className="text-red-400">*</span>
              </Label>
              <Input
                id="formEmail"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formOrganization" className="text-white/90">
              Organization
            </Label>
            <Input
              id="formOrganization"
              type="text"
              name="organization"
              placeholder="University, company or team (optional)"
              value={formData.organization}
              onChange={handleChange}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="formServiceType" className="text-white/90">
              Service of Interest <span className="text-red-400">*</span>
            </Label>
            <select
              id="formServiceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className={cn(selectClass, 'bg-white/5 border-white/10 text-white')}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <option value="" className="bg-brand-deep text-white/70">
                Select a service
              </option>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type} className="bg-brand-deep text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formMessage" className="text-white/90">
              Message <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="formMessage"
              name="message"
              rows={6}
              placeholder="Tell us about your project, goals, timeline, and anything else we should know..."
              value={formData.message}
              onChange={handleChange}
              required
              minLength={20}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[140px]"
            />
            <p className="text-xs text-white/40">Minimum 20 characters.</p>
          </div>

          <Button
            type="submit"
            variant="brand"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;
