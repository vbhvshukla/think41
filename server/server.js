const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5550;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory data store (for demo purposes)
let users = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@think41.com',
    password: 'password123',
    role: 'user'
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Think41 API Server is running!',
    info: 'This is a demo API server using Express.js'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Think41 Server is running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}`);
});
