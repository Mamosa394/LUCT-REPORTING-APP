// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const config = require('./config');
const routes = require('./routes');
const { errorHandler } = require('./middleware');
const { initializeFirebase } = require('./services');

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: config.corsConfig,
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors(config.corsConfig));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit(config.rateLimitConfig);
app.use('/api', limiter);

// Initialize Firebase
initializeFirebase();

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('join-course', (courseId) => {
    socket.join(`course_${courseId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = config.serverConfig.port;
httpServer.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${config.serverConfig.env}`);
  console.log(` Frontend URL: ${config.serverConfig.frontendUrl}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  httpServer.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  httpServer.close(() => process.exit(1));
});

module.exports = { app, httpServer, io };