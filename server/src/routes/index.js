// backend/src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
// more routes to be added later

router.use('/auth', authRoutes);

// Example protected route
const { protect } = require('../middleware/autoMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/admin/dashboard', protect, authorizeRoles('admin'), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

module.exports = router;
