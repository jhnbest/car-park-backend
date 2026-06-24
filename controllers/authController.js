const AuthService = require('../services/authService');
const AuditLogService = require('../services/auditLogService');
const IpUtil = require('../utils/ipUtil');
const DeviceUtil = require('../utils/deviceUtil');

class AuthController {
  static authService = new AuthService();
  /**
   * 用户注册
   */
  static async register(req, res) {
    try {
      const { username, password, email, role } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      const result = await AuthController.authService.register(username, password, email, role);
      
      res.status(201).json({
        success: true,
        data: result,
        message: '注册成功'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 用户登录
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (username === undefined || password === undefined) {
        return res.status(400).json({
          success: false,
          message: '请求参数格式错误'
        });
      }

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      const result = await AuthController.authService.login(username, password);

      const ipAddress = IpUtil.getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';
      const deviceInfo = DeviceUtil.formatDeviceInfo(DeviceUtil.parseUserAgent(userAgent));

      await AuditLogService.logLogin(
        { id: result.user?.id, name: result.user?.name, username },
        'SUCCESS',
        ipAddress,
        deviceInfo,
        req
      );

      res.json({
        success: true,
        data: result,
        message: '登录成功'
      });
    } catch (error) {
      console.error('登录错误:', error.message);

      const ipAddress = IpUtil.getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';
      const deviceInfo = DeviceUtil.formatDeviceInfo(DeviceUtil.parseUserAgent(userAgent));

      await AuditLogService.logLogin(
        { username },
        'FAIL',
        ipAddress,
        deviceInfo,
        req,
        error.message
      );

      if (error.message.includes('bcrypt')) {
        return res.status(400).json({
          success: false,
          message: '密码处理错误'
        });
      }

      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getProfile(req, res) {
    try {
      const result = await AuthController.authService.getUserInfo(req.user.id);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: result.user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;