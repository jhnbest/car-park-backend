const express = require('express');
const router = express.Router();
const BaseController = require('../controllers/baseController');
const { authenticateToken } = require('../middleware/authMiddleware');

// 健康检查路由（无需认证）
router.get('/health', BaseController.healthCheck);

// 数据路由（需要认证）
router.get('/data', authenticateToken, BaseController.getAll);

module.exports = router;