const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
// Serve static files (uploads, pdfs, logos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs'))); // ✅ For certificate PDFs
app.use('/logos', express.static(path.join(__dirname, 'logos'))); // ✅ For certificate logos

// Database connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/certificates', require('./routes/certificateRoutes')); // ✅ Certificate routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Test endpoint to check complaints in database
app.get('/api/test/complaints', async (req, res) => {
  try {
    const Complaint = require('./models/Complaint');
    const count = await Complaint.countDocuments();
    const complaints = await Complaint.find().limit(5);
    res.json({
      count,
      complaints,
      message: `Found ${count} complaints in database`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test SMS endpoint (temporary)
app.get('/api/test/sms', async (req, res) => {
  const smsService = require('./services/smsService');

  try {
    const testNumber = req.query.number || '+919876543210';

    const result = await smsService.sendComplaintRegistered(
      testNumber,
      {
        customerName: 'Test Customer',
        complaintId: 'TEST-001',
        expectedResolutionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    );

    res.json({
      success: true,
      message: 'Test SMS sent!',
      sid: result?.sid,
      to: testNumber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test WhatsApp endpoint (temporary)
app.get('/api/test/whatsapp', async (req, res) => {
  const whatsappService = require('./services/whatsappService');

  try {
    const testNumber = req.query.number || '+919876543210';

    const result = await whatsappService.sendComplaintRegistered(
      testNumber,
      {
        customerName: 'Test Customer',
        complaintId: 'TEST-WA-001',
        expectedResolutionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    );

    res.json({
      success: true,
      message: 'Test WhatsApp sent!',
      result: result,
      to: testNumber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📁 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📊 Test complaints: http://localhost:${PORT}/api/test/complaints`);
  console.log(`📜 Certificate API: http://localhost:${PORT}/api/certificates`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});