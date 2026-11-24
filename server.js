const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const initUsersTable = require('./database/init-users');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const salesRoutes = require('./routes/sales');
const dashboardRoutes = require('./routes/dashboard');
const exchangeRoutes = require('./routes/exchange');

const app = express();
let userTableInitialization;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

async function ensureUsersTable() {
  if (!userTableInitialization) userTableInitialization = initUsersTable();
  try {
    await userTableInitialization;
  } catch (error) {
    userTableInitialization = null;
    throw error;
  }
}

app.use('/api', async (req, res, next) => {
  try {
    await ensureUsersTable();
    next();
  } catch (error) {
    console.error('User table initialization failed:', error.message);
    res.status(503).json({ success: false, message: 'The database is not ready.' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/exchange', exchangeRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, async () => {
    console.log('Auto Part System is running on http://localhost:' + port);
    try {
      await ensureUsersTable();
    } catch (error) {
      console.error('User table initialization failed:', error.message);
    }
  });
}

module.exports = app;