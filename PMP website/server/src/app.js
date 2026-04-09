const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { CLIENT_URL, NODE_ENV } = require('./config/env');
const errorHandler = require('./middleware/errorHandler.middleware');

const authRoutes = require('./routes/auth.routes');
const chapterRoutes = require('./routes/chapter.routes');
const topicRoutes = require('./routes/topic.routes');
const practiceRoutes = require('./routes/practice.routes');
const examRoutes = require('./routes/exam.routes');
const certificateRoutes = require('./routes/certificate.routes');
const verifyRoutes = require('./routes/verify.routes');
const progressRoutes = require('./routes/progress.routes');

const app = express();

// Trust the first proxy (system nginx) so req.ip and X-Forwarded-For
// are honored correctly by express-rate-limit and cookie `secure` checks.
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression & logging
app.use(compression());
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve client build in production
if (NODE_ENV === 'production') {
  const path = require('path');
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

module.exports = app;
