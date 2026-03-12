require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes    = require('./routes/authRoutes');
const calorieRoutes = require('./routes/calorieRoutes');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', authRoutes);
app.use('/api', calorieRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'FITX API running ✅' }));

// Catch-all: serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🏋️  FITX Server running on http://localhost:${PORT}`);
  console.log(`📊  API available at http://localhost:${PORT}/api`);
});
