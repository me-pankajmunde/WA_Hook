const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// GET /webhook - Verification endpoint
router.get('/', webhookController.verify.bind(webhookController));

// POST /webhook - Message handling endpoint
router.post('/', webhookController.handleMessage.bind(webhookController));

module.exports = router;
