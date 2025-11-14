const express = require('express');
const router = express.Router();
const ApiController = require('../controllers/apiController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * 获取停车场数据
 * @route GET /api/parking/data
 * @desc 获取停车场数据信息
 * @access Private
 */
router.get('/data', authenticateToken, ApiController.getAllParkingData);

module.exports = router;