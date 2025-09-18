const UserModel = require('../models/userModel');

class AuthController {
  /**
   * 用户注册
   */
  static async register(req, res) {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      const result = await UserModel.register(username, password, role);
      
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
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      const result = await UserModel.login(username, password);
      
      res.json({
        success: true,
        data: result,
        message: '登录成功'
      });
    } catch (error) {
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
      const user = await UserModel.getById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: user
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