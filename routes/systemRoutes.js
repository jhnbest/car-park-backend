const express = require('express');
const router = express.Router();
const SystemController = require('../controllers/systemController');

/**
 * 健康检查
 * @route GET /api/system/health
 * @desc 服务健康状态检查
 * @access Public
 */
router.get('/health', SystemController.healthCheck);

/**
 * 服务状态信息
 * @route GET /api/system/status
 * @desc 获取服务状态和可用端点信息
 * @access Public
 */
router.get('/status', SystemController.getStatus);

module.exports = router;