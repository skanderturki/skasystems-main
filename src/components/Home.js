import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Workflow,
  Bot,
  BookOpen,
  Sparkles,
  Check,
  ArrowRight,
  Package,
  MessageSquare,
  Zap,
} from 'lucide-react';
import ContactForm from './ContactForm';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

/* -------------------------------------------------------------------------- */
/*  Animated grid + glow background (from 21st.dev magic — variant 3)         */
/* -------------------------------------------------------------------------- */

function GridGlowBackground({
  children,
  backgroundColor = '#050a18',
  gridColor = 'rgba(139, 92, 246, 0.08)',
  gridSize = 60,
  glowColors = ['#0e2a47', '#1e3a5f', '#4a90b8', '#6ba4cf'],
  glowCount = 14,
  className,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let glows = [];
    let frameId;

    class Glow {
      constructor() {
        this.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        this.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        this.targetX = this.x;
        this.targetY = this.y;
        this.radius = Math.random() * 120 + 80;
        this.speed = Math.random() * 0.015 + 0.008;
        this.color = glowColors[Math.floor(Math.random() * glowColors.length)];
        this.alpha = 0;
        this.setNewTarget();
      }

      setNewTarget() {
        this.targetX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        this.targetY = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
      }

      update() {
        this.x += (this.targetX - this.x) * this.speed;
        this.y += (this.targetY - this.y) * this.speed;
        if (
          Math.abs(this.targetX - this.x) < 1 &&
          Math.abs(this.targetY - this.y) < 1
        ) {
          this.setNewTarget();
        }
        if (this.alpha < 1) this.alpha += 0.01;
      }

      draw() {
        ctx.globalAlpha = this.alpha;
        const grad = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.radius
        );
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      canvas.height = parent ? parent.offsetHeight : window.innerHeight;
      glows = Array.from({ length: glowCount }, () => new Glow());
    };

    const drawGrid = () => {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      glows.forEach((g) => {
        g.update();
        g.draw();
      });
      frameId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, [gridColor, gridSize, glowColors, glowCount]);

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{ backgroundColor }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 h-full w-full opacity-60"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.8,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

function Hero() {
  return (
    <GridGlowBackground className="min-h-[calc(100vh-13rem)] flex items-center">
      <div className="container-page relative py-20 md:py-28 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white/80 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-steel opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-steel"></span>
          </span>
          University Software Solutions for Quality Assurance
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mx-auto max-w-5xl mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="inline text-gradient-brand">
            Quality Assurance Software for Universities and Accreditation
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl"
        >
          Academix builds the platforms universities use to manage course quality, assess
          learning outcomes, and generate the evidence required for ABET, NCAAA, and
          institutional accreditation reviews — at scale, with auditable workflows.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild variant="brand" size="lg">
            <a href="#services">
              Explore Our Solutions
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#contact">Talk to Our Team</a>
          </Button>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/50"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>ABET-aligned</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>NCAAA-aligned</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Tunisia-based, university-trusted</span>
          </div>
        </motion.div>
      </div>
    </GridGlowBackground>
  );
}

/* -------------------------------------------------------------------------- */
/*  About                                                                      */
/* -------------------------------------------------------------------------- */

function About() {
  const capabilities = [
    {
      Icon: GraduationCap,
      label: 'Quality & Accreditation',
      desc: 'CLO/PLO assessment + ABET/NCAAA evidence',
    },
    {
      Icon: Workflow,
      label: 'Process Automation',
      desc: 'Self-hosted n8n + LMS/SIS integrations',
    },
    {
      Icon: Bot,
      label: 'AI for Academia',
      desc: 'Curriculum parsing + RAG advising',
    },
  ];

  return (
    <section
      id="about"
      className="section-anchor relative bg-brand-deep/50 border-y border-white/5"
    >
      <div
        className="absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(107,164,207,0.18), transparent 70%)',
        }}
      />
      <div className="container-page relative py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-steel uppercase tracking-widest mb-6">
            Who We Are
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-6">
            An independent studio specialized in{' '}
            <span className="text-gradient-brand">university quality &amp; accreditation</span>
          </h2>
          <p className="text-lg text-white/70 leading-relaxed mb-5">
            Academix is an independent software studio focused on the operational backbone
            of university quality: course learning outcomes, programme outcomes, accreditation
            evidence, and the academic processes that produce them. We design and ship
            platforms that turn institutional QA work from spreadsheet-and-email into
            structured, auditable systems.
          </p>
          <p className="text-base text-white/60 leading-relaxed">
            From CLO/PLO assessment platforms with verifiable evidence trails to
            AI-assisted curriculum analysis grounded in your own regulations and rubrics,
            we help universities, colleges, and accreditation offices deliver on quality
            without the overhead of an internal dev team.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {capabilities.map(({ Icon, label, desc }) => (
            <div
              key={label}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center transition hover:border-brand-steel/40 hover:bg-white/[0.04]"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-navy/30 to-brand-light/30 border border-white/10 mb-4 group-hover:scale-110 transition">
                <Icon className="h-6 w-6 text-brand-steel" />
              </div>
              <h3 className="text-base font-semibold text-white">{label}</h3>
              <p className="text-sm text-white/50 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Services                                                                   */
/* -------------------------------------------------------------------------- */

const SERVICES = [
  {
    Icon: BookOpen,
    badge: 'Quality & Accreditation',
    title: 'University Quality Assurance Platforms',
    description:
      'Full-featured QA platforms for universities pursuing ABET, NCAAA, or local accreditation. Manage curricula, courses, course offerings, learning outcomes, assessment, and auditable evidence — all in one auditable system.',
    features: [
      'Curriculum & programme outcomes (PLO) modeling',
      'Course learning outcome (CLO) assessment & analysis',
      'Direct + indirect assessment (surveys, rubrics, exams)',
      'Course reports, coordinator reports, programme reports',
      'ABET / NCAAA evidence trails with file storage',
    ],
    cta: {
      label: 'Request a demo',
      href: '#contact',
      external: false,
    },
    accent: 'from-brand-navy/40 via-brand-navy/10 to-transparent',
    iconBg: 'from-brand-navy/30 to-brand-steel/20',
    glowColor: '#0e2a47',
  },
  {
    Icon: Workflow,
    badge: 'Process Automation',
    title: 'Academic Process Automation',
    description:
      'Replace repetitive academic admin work with custom workflows on self-hosted n8n. We integrate with your LMS, SIS, file storage, email, and existing forms to automate admissions, grading pipelines, evidence collection and stakeholder communication.',
    features: [
      'Self-hosted n8n server setup',
      'LMS, SIS & Google Workspace integrations',
      'Automated emails, notifications, internal reports',
      'Document generation (transcripts, certificates, reports)',
      'AI-assisted content and grading workflows',
    ],
    cta: {
      label: 'Explore Our n8n Server',
      href: 'https://n8n.academix.tn',
      external: true,
    },
    accent: 'from-brand-steel/40 via-brand-steel/10 to-transparent',
    iconBg: 'from-brand-steel/30 to-emerald-500/20',
    glowColor: '#4a90b8',
  },
  {
    Icon: Sparkles,
    badge: 'AI for Academia',
    title: 'AI-Powered Curriculum & Advising Tools',
    description:
      'Apply LLMs to the document-heavy work academic departments do daily — parsing curricula, drafting course specifications, advising students against your own regulations and catalogs.',
    features: [
      'Curriculum PDF import (Gemini-assisted parsing)',
      'RAG chatbots grounded in your regulations and catalogs',
      'Course specification & report drafting assistance',
      'Indirect assessment survey synthesis',
      'Configurable tone & policy guardrails',
    ],
    cta: {
      label: 'Request Early Access',
      href: '#contact',
      external: false,
    },
    accent: 'from-brand-light/40 via-brand-light/10 to-transparent',
    iconBg: 'from-brand-light/30 to-brand-glow/20',
    glowColor: '#6ba4cf',
  },
];

function Services() {
  return (
    <section id="services" className="section-anchor relative bg-mesh-dark">
      <div className="absolute inset-0 grid-overlay opacity-30" aria-hidden="true" />
      <div className="container-page relative py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-steel uppercase tracking-widest mb-6">
            What We Build
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-5">
            Three core offerings,{' '}
            <span className="text-gradient-brand">one tailored solution</span> for your institution
          </h2>
          <p className="text-lg text-white/60">
            Each service is delivered as a custom build for your university, accreditation
            body, and existing stack.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {SERVICES.map((svc) => (
            <motion.div
              key={svc.badge}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              className="group relative"
            >
              {/* Outer glow */}
              <div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${svc.glowColor}66, transparent 60%)`,
                }}
                aria-hidden="true"
              />
              <div className="relative h-full flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 overflow-hidden transition group-hover:border-white/20 group-hover:-translate-y-1">
                {/* Accent gradient top */}
                <div
                  className={cn(
                    'absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-70',
                    svc.accent
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    'inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br border border-white/10 mb-5',
                    svc.iconBg
                  )}
                >
                  <svc.Icon className="h-7 w-7 text-white" />
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/80 uppercase tracking-wider">
                    {svc.badge}
                  </span>
                  {svc.badgeExtra && (
                    <span className="inline-flex items-center rounded-full border border-brand-light/40 bg-brand-light/15 px-2.5 py-0.5 text-xs font-medium text-brand-light uppercase tracking-wider">
                      {svc.badgeExtra}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3 leading-snug">
                  {svc.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  {svc.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {svc.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-white/75">
                      <Check className="h-4 w-4 text-brand-steel mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full mt-auto"
                >
                  <a
                    href={svc.cta.href}
                    target={svc.cta.external ? '_blank' : undefined}
                    rel={svc.cta.external ? 'noopener noreferrer' : undefined}
                  >
                    {svc.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Why Choose Us                                                              */
/* -------------------------------------------------------------------------- */

const PILLARS = [
  {
    Icon: GraduationCap,
    title: 'Quality-First Expertise',
    desc: 'Built on hands-on experience with curriculum design, accreditation reviews, CLO/PLO frameworks, and the actual mechanics of ABET and NCAAA submissions — not generic templates retrofitted for universities.',
  },
  {
    Icon: Package,
    title: 'End-to-End Delivery',
    desc: 'We handle architecture, development, deployment and hosting. You get a working platform on your own domain, not a pile of code.',
  },
  {
    Icon: MessageSquare,
    title: 'Direct & Responsive',
    desc: 'You work directly with the people building your product. No account managers, no hand-offs, no surprises.',
  },
];

function WhyChoose() {
  return (
    <section className="section-anchor relative bg-brand-deep border-y border-white/5">
      <div
        className="absolute inset-0 opacity-50"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(107,164,207,0.12), transparent 60%)',
        }}
      />
      <div className="container-page relative py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-steel uppercase tracking-widest mb-6">
            Why Academix
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-5">
            A small, hands-on team with a{' '}
            <span className="text-gradient-brand">strong focus on university quality</span>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PILLARS.map(({ Icon, title, desc }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="relative text-center"
            >
              <div className="relative inline-flex mb-6">
                <div
                  className="absolute inset-0 rounded-2xl bg-brand-navy/40 blur-2xl"
                  aria-hidden="true"
                />
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-brand-navy/20 to-brand-light/20 backdrop-blur-sm">
                  <Icon className="h-8 w-8 text-brand-steel" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
              <p className="text-sm text-white/60 leading-relaxed max-w-sm mx-auto">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contact                                                                    */
/* -------------------------------------------------------------------------- */

function ContactSection() {
  return (
    <section id="contact" className="section-anchor relative bg-mesh-dark">
      <div className="absolute inset-0 grid-overlay opacity-30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(74,144,184,0.15), transparent 70%)',
        }}
      />
      <div className="container-page relative py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-steel uppercase tracking-widest mb-6">
            <Zap className="h-3.5 w-3.5" />
            Start Your Project
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-5">
            Let's talk about{' '}
            <span className="text-gradient-brand">your quality programme</span>
          </h2>
          <p className="text-lg text-white/60">
            Tell us what you want to build or automate — we'll get back to you.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Home                                                                       */
/* -------------------------------------------------------------------------- */

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <WhyChoose />
      <ContactSection />
    </>
  );
}

export default Home;
