const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/auditLogController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', AuditLogController.getLogs);

router.get('/stats', AuditLogController.getStats);

router.get('/export', AuditLogController.exportLogs);

router.get('/:id', AuditLogController.getLogById);

router.delete('/cleanup', AuditLogController.cleanupLogs);

module.exports = router;
