import { useState, useEffect } from 'react';
import { Menu, X, GraduationCap, Workflow, Bot, Mail } from 'lucide-react';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Portfolio from './components/Portfolio';
import { useAuth } from './contexts/AuthContext';
import { cn } from './lib/utils';

function BrandLogo({ className }) {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Neural Network / Brain-inspired Logo */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#e3f2fd" stopOpacity="0.9" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer circle with tech pattern */}
      <circle
        cx="36"
        cy="36"
        r="34"
        fill="rgba(255, 255, 255, 0.15)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1"
      />

      {/* Neural network nodes */}
      <circle cx="20" cy="20" r="4" fill="white" opacity="0.9" filter="url(#glow)" />
      <circle cx="52" cy="20" r="4" fill="white" opacity="0.9" filter="url(#glow)" />
      <circle cx="20" cy="52" r="4" fill="white" opacity="0.9" filter="url(#glow)" />
      <circle cx="52" cy="52" r="4" fill="white" opacity="0.9" filter="url(#glow)" />
      <circle cx="36" cy="36" r="5" fill="url(#logoGradient)" filter="url(#glow)" />
      <circle cx="28" cy="28" r="3" fill="white" opacity="0.7" />
      <circle cx="44" cy="28" r="3" fill="white" opacity="0.7" />
      <circle cx="28" cy="44" r="3" fill="white" opacity="0.7" />
      <circle cx="44" cy="44" r="3" fill="white" opacity="0.7" />

      {/* Connections - Neural network */}
      <path
        d="M20 20 L28 28 M28 28 L36 36 M36 36 L44 28 M44 28 L52 20"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.6"
        strokeLinecap="round"
      />
      <path
        d="M20 52 L28 44 M28 44 L36 36 M36 36 L44 44 M44 44 L52 52"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.6"
        strokeLinecap="round"
      />
      <path
        d="M20 20 L28 28 M52 20 L44 28 M20 52 L28 44 M52 52 L44 44"
        stroke="white"
        strokeWidth="1"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* Data flow arrows */}
      <path
        d="M32 32 L36 36 L32 40"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 32 L36 36 L40 40"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURE_CHIPS = [
  { label: 'Learning Platforms', Icon: GraduationCap },
  { label: 'Academic Automation', Icon: Workflow },
  { label: 'AI Student Advisors', Icon: Bot },
];

function App() {
  const { isAuthenticated, logout } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Handle hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      // Strip any section-anchor portion; we only route on top-level views
      const view = hash.split('#')[0].split('/')[0];
      if (['home', 'login', 'register', 'portfolio'].includes(view)) {
        setCurrentView(view);
      } else {
        // It's a section anchor like #about/#services/#contact — stay on home
        setCurrentView('home');
      }
      setMobileOpen(false);
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

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#contact', label: 'Contact' },
    {
      href: 'https://pmp.skasystems.com',
      label: 'PMP Platform',
      external: true,
    },
  ];

  return (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50">
        {/* Banner with gradient mesh background */}
        <div className="relative overflow-hidden bg-mesh-banner border-b border-white/10">
          {/* Grid overlay */}
          <div className="absolute inset-0 grid-overlay opacity-60 animate-grid-move" aria-hidden="true" />

          {/* Floating glow orbs */}
          <div
            className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-brand-blue/30 blur-3xl animate-float"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-brand-violet/25 blur-3xl animate-float-reverse"
            aria-hidden="true"
          />

          {/* Binary scroll decoration */}
          <div className="pointer-events-none absolute top-2 left-0 right-0 overflow-hidden">
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/15 whitespace-nowrap animate-binary-scroll">
              01001000 01100101 01101100 01101100 01101111 00100000 01010011 01001011 01000001 00100000 01010011 01111001 01110011 01110100 01100101 01101101 01110011
            </div>
          </div>

          <div className="container-page relative z-10 py-6 md:py-8">
            <div className="flex flex-wrap items-center justify-between gap-5">
              {/* Brand */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full bg-brand-blue/40 blur-xl animate-glow"
                    aria-hidden="true"
                  />
                  <BrandLogo className="relative h-14 w-14 sm:h-[72px] sm:w-[72px] animate-pulse-slow drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] transition hover:scale-105 hover:rotate-3" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-white">
                    SKA Systems
                  </h1>
                  <p className="text-xs sm:text-sm text-white/80 mt-1">
                    Intelligent Software for Education &amp; Academia
                  </p>
                </div>
              </div>

              {/* Feature chips */}
              <div className="hidden md:flex flex-wrap gap-2">
                {FEATURE_CHIPS.map(({ label, Icon }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/20 hover:border-white/30 hover:-translate-y-0.5"
                  >
                    <Icon className="h-3.5 w-3.5 text-brand-cyan" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navbar */}
        <nav className="relative border-b border-white/10 bg-brand-deep/80 backdrop-blur-lg supports-[backdrop-filter]:bg-brand-deep/60">
          <div className="container-page flex h-14 items-center justify-between">
            <a href="#home" className="flex items-center gap-2 text-white font-semibold">
              <BrandLogo className="h-7 w-7" />
              <span>SKA Systems</span>
            </a>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated && (
                <>
                  <a
                    href="https://n8n.skasystems.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white hover:bg-white/10"
                  >
                    n8n Server
                  </a>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white hover:bg-white/10"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10 transition"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile nav drawer */}
          <div
            className={cn(
              'lg:hidden overflow-hidden border-t border-white/10 bg-brand-deep/95 backdrop-blur-lg transition-[max-height,opacity] duration-300',
              mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="container-page py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated && (
                <>
                  <a
                    href="https://n8n.skasystems.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
                  >
                    n8n Server
                  </a>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-left rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {currentView === 'login' ? (
          <Login />
        ) : currentView === 'register' ? (
          <Register />
        ) : currentView === 'portfolio' ? (
          <Portfolio />
        ) : (
          <Home />
        )}
      </main>

      <footer className="relative bg-brand-deep text-white/80 border-t border-white/10">
        {/* Gradient hairline */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-violet" />

        <div className="container-page py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-3">
            {/* Brand col */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <BrandLogo className="h-10 w-10" />
                <span className="font-bold text-white text-lg">SKA Systems</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed max-w-sm">
                Intelligent software for education and academia — personalized learning
                platforms, academic automation, and AI advising tools.
              </p>
            </div>

            {/* Platforms col */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Platforms
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://pmp.skasystems.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-brand-cyan transition"
                  >
                    PMP Platform
                  </a>
                </li>
                <li>
                  <a
                    href="https://n8n.skasystems.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-brand-cyan transition"
                  >
                    n8n Server
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-white/70 hover:text-brand-cyan transition">
                    All Services
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact col */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Get in Touch
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:skanderturki@gmail.com"
                    className="inline-flex items-center gap-2 text-white/70 hover:text-brand-cyan transition"
                  >
                    <Mail className="h-4 w-4" />
                    skanderturki@gmail.com
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-white/70 hover:text-brand-cyan transition">
                    Contact form
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
            <p>© {new Date().getFullYear()} SKA Systems — Intelligent Software for Education &amp; Academia</p>
            <p className="font-mono">Built with care for educators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
