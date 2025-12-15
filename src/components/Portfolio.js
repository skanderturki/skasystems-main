import { useState } from 'react';
import { Row, Col, Card, Badge, Button, Modal, Tab, Tabs } from 'react-bootstrap';

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
    industries: ['E-commerce', 'Sales', 'Marketing']
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
    industries: ['Marketing', 'E-commerce', 'Customer Service']
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
    industries: ['Marketing', 'Content Creation', 'Social Media']
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
    industries: ['Customer Service', 'E-commerce', 'SaaS']
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
    industries: ['E-commerce', 'Retail', 'Logistics']
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
    industries: ['Analytics', 'Business Intelligence', 'Data Science']
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
    industries: ['Sales', 'Marketing', 'B2B Services']
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
    industries: ['Finance', 'Legal', 'Administration']
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
    industries: ['All Industries']
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
    industries: ['E-commerce', 'Retail', 'Manufacturing']
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
    industries: ['Business Intelligence', 'Management', 'Analytics']
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
    industries: ['All Industries']
  }
];

function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const filteredWorkflows = selectedCategory === 'All' 
    ? WORKFLOWS 
    : WORKFLOWS.filter(w => w.category === selectedCategory);

  const handleWorkflowClick = (workflow) => {
    setSelectedWorkflow(workflow);
  };

  const handleCloseModal = () => {
    setSelectedWorkflow(null);
  };

  return (
    <div className="portfolio-page">
      {/* Header Section */}
      <section className="portfolio-header py-5 mb-5">
        <Row>
          <Col className="text-center">
            <h1 className="display-4 fw-bold mb-3">Workflow Portfolio</h1>
            <p className="lead text-muted mb-4">
              Explore real-world n8n workflow examples and automation scenarios
            </p>
          </Col>
        </Row>
      </section>

      {/* Category Filter */}
      <section className="portfolio-filters mb-5">
        <Row>
          <Col>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {WORKFLOW_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline-primary'}
                  onClick={() => setSelectedCategory(category)}
                  className="mb-2"
                >
                  {category}
                </Button>
              ))}
            </div>
          </Col>
        </Row>
      </section>

      {/* Workflows Grid */}
      <section className="workflows-section mb-5">
        <Row className="g-4">
          {filteredWorkflows.map((workflow) => (
            <Col key={workflow.id} md={6} lg={4}>
              <Card className="h-100 shadow-sm border-0 workflow-card" onClick={() => handleWorkflowClick(workflow)} style={{ cursor: 'pointer' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-start mb-3">
                    <div className="workflow-icon me-3" style={{ fontSize: '2.5rem' }}>
                      {workflow.icon}
                    </div>
                    <div className="flex-grow-1">
                      <Badge bg="primary" className="mb-2">{workflow.category}</Badge>
                      <Badge bg="secondary" className="ms-2 mb-2">{workflow.complexity}</Badge>
                      <Card.Title className="h5 mb-2">{workflow.title}</Card.Title>
                    </div>
                  </div>
                  <Card.Text className="text-muted mb-3">
                    {workflow.description}
                  </Card.Text>
                  <div className="mb-3">
                    <small className="text-muted fw-bold">Industries: </small>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {workflow.industries.map((industry, idx) => (
                        <Badge key={idx} bg="light" text="dark" className="small">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline-primary" size="sm" className="w-100">
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Workflow Detail Modal */}
      <Modal show={selectedWorkflow !== null} onHide={handleCloseModal} size="lg">
        {selectedWorkflow && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                <div className="d-flex align-items-center">
                  <span className="me-3" style={{ fontSize: '2rem' }}>{selectedWorkflow.icon}</span>
                  <div>
                    <div>{selectedWorkflow.title}</div>
                    <div>
                      <Badge bg="primary" className="me-2">{selectedWorkflow.category}</Badge>
                      <Badge bg="secondary">{selectedWorkflow.complexity} Complexity</Badge>
                    </div>
                  </div>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Tabs defaultActiveKey="overview" className="mb-3">
                <Tab eventKey="overview" title="Overview">
                  <div className="mt-3">
                    <h5>Description</h5>
                    <p>{selectedWorkflow.description}</p>
                    
                    <h5 className="mt-4">Use Case</h5>
                    <p>{selectedWorkflow.useCase}</p>
                    
                    <h5 className="mt-4">Benefits</h5>
                    <ul>
                      {selectedWorkflow.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </Tab>
                <Tab eventKey="workflow" title="Workflow Details">
                  <div className="mt-3">
                    <h5>Workflow Nodes</h5>
                    <div className="workflow-nodes mb-4">
                      {selectedWorkflow.nodes.map((node, idx) => (
                        <div key={idx} className="d-inline-block me-2 mb-2">
                          <Badge bg="info" className="px-3 py-2">
                            {node}
                          </Badge>
                          {idx < selectedWorkflow.nodes.length - 1 && (
                            <span className="mx-2 text-muted">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <h5>Industries</h5>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {selectedWorkflow.industries.map((industry, idx) => (
                        <Badge key={idx} bg="light" text="dark" className="px-3 py-2">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                    
                    <h5>Complexity Level</h5>
                    <p className="text-muted">{selectedWorkflow.complexity} - This workflow requires {selectedWorkflow.complexity.toLowerCase()} level n8n knowledge and configuration.</p>
                  </div>
                </Tab>
                <Tab eventKey="implementation" title="Implementation">
                  <div className="mt-3">
                    <h5>Getting Started</h5>
                    <p>This workflow can be implemented using n8n's visual workflow builder. Key steps include:</p>
                    <ol>
                      <li>Set up the trigger node (webhook, schedule, or manual)</li>
                      <li>Configure API connections and authentication</li>
                      <li>Add data transformation nodes as needed</li>
                      <li>Set up error handling and notifications</li>
                      <li>Test and activate the workflow</li>
                    </ol>
                    
                    <div className="alert alert-info mt-4">
                      <strong>Need Help?</strong> Our team can help you implement this workflow or customize it for your specific needs. 
                      <a href="#contact" className="ms-2" onClick={handleCloseModal}>Contact us</a> to get started.
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              <Button variant="primary" href="#contact" onClick={handleCloseModal}>
                Request This Workflow
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Portfolio;

