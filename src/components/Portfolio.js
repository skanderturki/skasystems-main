import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const WORKFLOW_CATEGORIES = ['All', 'Data Integration', 'Automation', 'AI & ML', 'E-commerce', 'Communication'];

const WORKFLOWS = [
  {
    id: 1,
    title: 'CRM to Database Sync',
    category: 'Data Integration',
    description: 'Automatically sync customer data from CRM systems to your database, keeping all systems up-to-date in real-time.',
    useCase: 'E-commerce companies need to keep customer data synchronized between their CRM (Salesforce, HubSpot) and internal databases.',
    benefits: ['Real-time data synchronization', 'Eliminates manual data entry', 'Reduces errors', 'Saves hours daily'],
    nodes: ['Webhook Trigger', 'CRM API', 'Data Transformation', 'Database Insert', 'Error Handler'],
    icon: '🔄',
    complexity: 'Medium',
    industries: ['E-commerce', 'Sales', 'Marketing'],
  },
  {
    id: 2,
    title: 'Automated Email Workflows',
    category: 'Communication',
    description: 'Send personalized emails based on triggers, schedule follow-ups, and manage email campaigns automatically.',
    useCase: 'Send welcome emails to new users, follow up after purchases, or notify customers about order status changes.',
    benefits: ['Improved customer engagement', 'Time-saving automation', 'Consistent communication', 'Higher conversion rates'],
    nodes: ['Schedule Trigger', 'Email Template', 'Personalization', 'Send Email', 'Analytics'],
    icon: '📧',
    complexity: 'Low',
    industries: ['Marketing', 'E-commerce', 'Customer Service'],
  },
  {
    id: 3,
    title: 'Social Media Auto-Posting',
    category: 'Automation',
    description: 'Automatically post content to multiple social media platforms from a single source, with scheduling and formatting.',
    useCase: 'Marketing teams want to post blog articles, product updates, or announcements across Twitter, LinkedIn, and Facebook simultaneously.',
    benefits: ['Multi-platform posting', 'Time-efficient', 'Consistent branding', 'Scheduled publishing'],
    nodes: ['RSS Feed Trigger', 'Content Parser', 'Image Processing', 'Twitter API', 'LinkedIn API', 'Facebook API'],
    icon: '📱',
    complexity: 'Medium',
    industries: ['Marketing', 'Content Creation', 'Social Media'],
  },
  {
    id: 4,
    title: 'AI-Powered Customer Support',
    category: 'AI & ML',
    description: 'Intelligent customer support system that routes tickets, generates responses, and escalates complex issues.',
    useCase: 'Handle customer inquiries automatically, classify tickets, provide instant responses using AI, and route to human agents when needed.',
    benefits: ['24/7 availability', 'Faster response times', 'Reduced workload', 'Improved customer satisfaction'],
    nodes: ['Webhook Trigger', 'AI Classification', 'LangChain', 'Response Generator', 'Ticket System', 'Email Notification'],
    icon: '🤖',
    complexity: 'High',
    industries: ['Customer Service', 'E-commerce', 'SaaS'],
  },
  {
    id: 5,
    title: 'Order Processing Automation',
    category: 'E-commerce',
    description: 'Complete order processing workflow from payment confirmation to shipping notification and inventory management.',
    useCase: 'When a customer places an order, automatically process payment, update inventory, create shipping labels, and send tracking information.',
    benefits: ['Faster order processing', 'Reduced errors', 'Inventory accuracy', 'Better customer experience'],
    nodes: ['Webhook Trigger', 'Payment Verification', 'Inventory Check', 'Shipping API', 'Email Notification', 'Database Update'],
    icon: '🛒',
    complexity: 'High',
    industries: ['E-commerce', 'Retail', 'Logistics'],
  },
  {
    id: 6,
    title: 'Data Analytics Pipeline',
    category: 'Data Integration',
    description: 'Collect data from multiple sources, transform and clean it, then load it into a data warehouse for analytics.',
    useCase: 'Aggregate data from various APIs, databases, and files, clean and transform it, then load into a data warehouse for business intelligence.',
    benefits: ['Centralized data', 'Automated ETL process', 'Real-time insights', 'Data quality improvement'],
    nodes: ['Schedule Trigger', 'Multiple Data Sources', 'Data Transformation', 'Data Validation', 'Data Warehouse', 'Reporting'],
    icon: '📊',
    complexity: 'High',
    industries: ['Analytics', 'Business Intelligence', 'Data Science'],
  },
  {
    id: 7,
    title: 'Lead Qualification & Routing',
    category: 'Automation',
    description: 'Automatically qualify leads from forms, assign scores, and route them to the appropriate sales team members.',
    useCase: 'When a lead submits a form, automatically score them based on criteria, assign to the right salesperson, and send notifications.',
    benefits: ['Faster lead response', 'Better lead quality', 'Improved conversion', 'Efficient routing'],
    nodes: ['Form Trigger', 'Lead Scoring', 'Data Enrichment', 'CRM Integration', 'Assignment Logic', 'Notification'],
    icon: '🎯',
    complexity: 'Medium',
    industries: ['Sales', 'Marketing', 'B2B Services'],
  },
  {
    id: 8,
    title: 'Document Processing & OCR',
    category: 'AI & ML',
    description: 'Automatically process documents, extract text using OCR, classify documents, and store them in the right location.',
    useCase: 'Process invoices, contracts, or forms automatically by extracting text, classifying document type, and storing in the appropriate system.',
    benefits: ['Automated document processing', 'Time savings', 'Improved accuracy', 'Better organization'],
    nodes: ['File Trigger', 'OCR Processing', 'AI Classification', 'Data Extraction', 'Storage System', 'Notification'],
    icon: '📄',
    complexity: 'Medium',
    industries: ['Finance', 'Legal', 'Administration'],
  },
  {
    id: 9,
    title: 'Multi-Channel Notification System',
    category: 'Communication',
    description: 'Send notifications across multiple channels (Email, SMS, Slack, Teams) based on events and user preferences.',
    useCase: 'Notify users about important events through their preferred channels, with fallback options and delivery confirmation.',
    benefits: ['Multi-channel reach', 'User preferences', 'Reliable delivery', 'Unified system'],
    nodes: ['Event Trigger', 'User Preferences', 'Channel Router', 'Email Service', 'SMS Service', 'Slack API', 'Delivery Status'],
    icon: '🔔',
    complexity: 'Medium',
    industries: ['All Industries'],
  },
  {
    id: 10,
    title: 'Inventory Management Automation',
    category: 'E-commerce',
    description: 'Monitor inventory levels, automatically reorder products, update multiple systems, and send alerts when stock is low.',
    useCase: 'Track inventory across multiple channels, automatically reorder when stock falls below threshold, and sync with all sales platforms.',
    benefits: ['Prevent stockouts', 'Automated reordering', 'Multi-channel sync', 'Cost optimization'],
    nodes: ['Schedule Trigger', 'Inventory Check', 'Threshold Logic', 'Reorder API', 'Multi-Channel Sync', 'Alert System'],
    icon: '📦',
    complexity: 'Medium',
    industries: ['E-commerce', 'Retail', 'Manufacturing'],
  },
  {
    id: 11,
    title: 'Scheduled Report Generation',
    category: 'Automation',
    description: 'Generate and distribute reports automatically on a schedule, with data aggregation from multiple sources.',
    useCase: 'Create daily, weekly, or monthly reports by pulling data from various systems, formatting it, and sending to stakeholders.',
    benefits: ['Automated reporting', 'Time savings', 'Consistent delivery', 'Data aggregation'],
    nodes: ['Schedule Trigger', 'Data Collection', 'Report Generation', 'Formatting', 'Email Distribution', 'Storage'],
    icon: '📈',
    complexity: 'Low',
    industries: ['Business Intelligence', 'Management', 'Analytics'],
  },
  {
    id: 12,
    title: 'API Integration Hub',
    category: 'Data Integration',
    description: 'Central hub for integrating multiple APIs, transforming data between formats, and routing to different systems.',
    useCase: 'Connect different services and APIs, transform data formats, handle authentication, and route data to appropriate destinations.',
    benefits: ['Centralized integration', 'Data transformation', 'Simplified architecture', 'Reusable workflows'],
    nodes: ['API Trigger', 'Authentication', 'Data Transformer', 'Format Converter', 'Router', 'Multiple APIs'],
    icon: '🔌',
    complexity: 'High',
    industries: ['All Industries'],
  },
];

function Badge({ children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/80',
        className
      )}
    >
      {children}
    </span>
  );
}

function WorkflowCard({ workflow, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 transition hover:border-brand-cyan/40 hover:bg-white/[0.06] hover:-translate-y-1"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 text-4xl">{workflow.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className="border-brand-blue/40 bg-brand-blue/15 text-brand-cyan">
              {workflow.category}
            </Badge>
            <Badge>{workflow.complexity}</Badge>
          </div>
          <h3 className="text-lg font-semibold text-white leading-tight">{workflow.title}</h3>
        </div>
      </div>
      <p className="text-sm text-white/60 leading-relaxed mb-4">{workflow.description}</p>
      <div className="mb-5">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
          Industries
        </p>
        <div className="flex flex-wrap gap-1.5">
          {workflow.industries.map((industry) => (
            <span
              key={industry}
              className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/60"
            >
              {industry}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-brand-cyan group-hover:text-brand-glow">
        View details
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function WorkflowModal({ workflow, onClose }) {
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!workflow) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow Details' },
    { id: 'implementation', label: 'Implementation' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-brand-deep shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-white/10">
          <div className="flex items-start gap-4 min-w-0">
            <span className="text-4xl flex-shrink-0">{workflow.icon}</span>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-white mb-2">{workflow.title}</h2>
              <div className="flex flex-wrap gap-2">
                <Badge className="border-brand-blue/40 bg-brand-blue/15 text-brand-cyan">
                  {workflow.category}
                </Badge>
                <Badge>{workflow.complexity} Complexity</Badge>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-white/10">
          <div className="flex gap-1 -mb-px">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'px-4 py-3 text-sm font-medium transition border-b-2',
                  tab === t.id
                    ? 'text-white border-brand-cyan'
                    : 'text-white/60 border-transparent hover:text-white/90'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 text-white/80 text-sm leading-relaxed space-y-5">
          {tab === 'overview' && (
            <>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Description</h3>
                <p>{workflow.description}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Use Case</h3>
                <p>{workflow.useCase}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Benefits</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {workflow.benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {tab === 'workflow' && (
            <>
              <div>
                <h3 className="text-base font-semibold text-white mb-3">Workflow Nodes</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {workflow.nodes.map((node, idx) => (
                    <div key={node} className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-xs font-medium text-brand-cyan">
                        {node}
                      </span>
                      {idx < workflow.nodes.length - 1 && (
                        <span className="text-white/40">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-3">Industries</h3>
                <div className="flex flex-wrap gap-2">
                  {workflow.industries.map((industry) => (
                    <Badge key={industry}>{industry}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Complexity Level</h3>
                <p className="text-white/60">
                  {workflow.complexity} - This workflow requires {workflow.complexity.toLowerCase()} level n8n knowledge and configuration.
                </p>
              </div>
            </>
          )}

          {tab === 'implementation' && (
            <>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Getting Started</h3>
                <p className="mb-3">
                  This workflow can be implemented using n8n's visual workflow builder. Key steps include:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>Set up the trigger node (webhook, schedule, or manual)</li>
                  <li>Configure API connections and authentication</li>
                  <li>Add data transformation nodes as needed</li>
                  <li>Set up error handling and notifications</li>
                  <li>Test and activate the workflow</li>
                </ol>
              </div>
              <div className="rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 p-4">
                <p className="text-sm text-white/80">
                  <strong className="text-brand-cyan">Need Help?</strong> Our team can help you implement this workflow or customize it for your specific needs.{' '}
                  <a
                    href="#contact"
                    className="text-brand-cyan hover:text-brand-glow underline"
                    onClick={onClose}
                  >
                    Contact us
                  </a>{' '}
                  to get started.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-3 p-5 border-t border-white/10 bg-white/[0.02]">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild variant="brand">
            <a href="#contact" onClick={onClose}>
              Request This Workflow
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const filteredWorkflows =
    selectedCategory === 'All' ? WORKFLOWS : WORKFLOWS.filter((w) => w.category === selectedCategory);

  return (
    <section className="relative bg-mesh-dark min-h-screen">
      <div className="absolute inset-0 grid-overlay opacity-30" aria-hidden="true" />
      <div className="container-page relative py-16 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-cyan uppercase tracking-widest mb-6">
            Portfolio
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Workflow <span className="text-gradient-brand">Portfolio</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Explore real-world n8n workflow examples and automation scenarios
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {WORKFLOW_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition border',
                  active
                    ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/30'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onClick={() => setSelectedWorkflow(workflow)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedWorkflow && (
        <WorkflowModal
          workflow={selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
        />
      )}
    </section>
  );
}

export default Portfolio;
