import { useState } from 'react';
import { LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
      } else {
        window.location.hash = '#home';
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
                  <LogIn className="h-6 w-6 text-brand-cyan" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Login</h2>
                <p className="text-sm text-white/60 mt-1">Welcome back to SKA Systems</p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail" className="text-white/90">
                    Email address
                  </Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword" className="text-white/90">
                    Password
                  </Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

                <p className="text-center text-sm text-white/60">
                  Don't have an account?{' '}
                  <a href="#register" className="text-brand-cyan hover:text-brand-glow transition">
                    Register here
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

export default Login;
