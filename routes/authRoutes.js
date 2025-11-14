const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * 用户注册
 * @route POST /api/auth/register
 * @desc 用户注册账号
 * @access Public
 */
router.post('/register', AuthController.register);

/**
 * 用户登录
 * @route POST /api/auth/login
 * @desc 用户登录获取访问令牌
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * 获取用户信息
 * @route GET /api/auth/profile
 * @desc 获取当前登录用户信息
 * @access Private
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;