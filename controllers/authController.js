const AuthService = require('../services/authService');

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
      
      res.json({
        success: true,
        data: result,
        message: '登录成功'
      });
    } catch (error) {
      console.error('登录错误:', error.message);
      
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