const express = require('express');
const router = express.Router();

// Import separate route files
const verificationRoutes = require('./verification');
const loginRoutes = require('./login');

// Use them
router.use('/', verificationRoutes);
router.use('/', loginRoutes);

module.exports = router;
