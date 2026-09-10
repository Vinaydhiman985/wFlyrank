const express = require('express');
const router = express.Router();
const protectedController = require('../controllers/protected.controller');
const requireAuth = require('../middlewares/auth.middleware');

router.get('/info', protectedController.getPublicInfo);

// Protected route using the new middleware
router.get('/profile', requireAuth, protectedController.getProtectedProfile);

module.exports = router;