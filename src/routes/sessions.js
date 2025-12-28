const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validator');

// All routes require authentication
router.use(authenticate);

// Session routes
router.get('/', sessionController.getSessions.bind(sessionController));
router.post('/', validate(schemas.createSession), sessionController.createSession.bind(sessionController));
router.get('/:sessionId', sessionController.getSession.bind(sessionController));
router.put('/:sessionId', sessionController.updateSession.bind(sessionController));
router.delete('/:sessionId', sessionController.deleteSession.bind(sessionController));
router.get('/:sessionId/stats', sessionController.getSessionStats.bind(sessionController));

module.exports = router;
