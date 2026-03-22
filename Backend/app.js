require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/calorieRoutes'));
app.use('/api', require('./routes/aiRoutes'));
app.use('/api', require('./routes/progressRoutes'));
app.use('/api', require('./routes/socialRoutes'));
app.get('/api/health', (req, res) => res.json({ status: 'FITX API ✅' }));
app.use((err, req, res, next) => { console.error(err.message); res.status(500).json({ message: 'Server error' }); });

app.use(express.static(path.join(__dirname, '../Frontend')));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../Frontend/index.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`\n🏋️  FITX running → http://localhost:${PORT}`);
  try { await require('./config/db').query('SELECT 1'); console.log('✅ MySQL connected'); }
  catch (e) { console.error('❌ MySQL failed:', e.message); }
});