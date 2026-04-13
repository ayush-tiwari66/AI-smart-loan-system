require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const loanRoutes = require('./routes/loans');
const creditRoutes = require('./routes/credit');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];

const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  const origin = req.header('Origin');
  
  // Allow requests with no origin (like mobile apps, postman, curl) or if origin is in the allowlist
  if (!origin || allowedOrigins.includes(origin)) {
    corsOptions = { origin: true, credentials: true }; 
  } else {
    corsOptions = { origin: false }; 
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartLoan API is running', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SmartLoan API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});
