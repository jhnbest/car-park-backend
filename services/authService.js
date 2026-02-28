const UserModel = require('../models/userModel');
const jwtUtils = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

/**
 * 用户认证服务 - 处理用户注册、登录、Token管理等业务逻辑
 */
class AuthService {
  /**
   * 用户注册服务
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} email - 邮箱
   * @param {string} role - 用户角色
   * @returns {Promise} 注册结果
   */
  async register(username, password, email, role = 'user') {
    try {
      // 检查用户名是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 创建用户
      const userData = {
        username,
        password: hashedPassword,
        email,
        role,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await UserModel.create(userData);
      
      return {
        success: true,
        message: '用户注册成功',
        userId: result.id
      };
    } catch (error) {
      console.error('用户注册失败:', error.message);
      throw error;
    }
  }

  /**
   * 用户登录服务
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise} 登录结果
   */
  async login(username, password) {
    try {
      const result = await UserModel.login(username, password);
      
      if (!result || !result.user) {
        throw new Error('用户名或密码错误');
      }

      return {
        success: true,
        message: '登录成功',
        token: result.token,
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email || '',
          role: result.user.role
        }
      };
    } catch (error) {
      console.error('用户登录失败:', error.message);
      if (error.message === '用户不存在' || error.message === '密码错误') {
        throw error;
      }
      throw new Error('用户名或密码错误');
    }
  }

  /**
   * 获取用户信息服务
   * @param {number} userId - 用户ID
   * @returns {Promise} 用户信息
   */
  async getUserInfo(userId) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      };
    } catch (error) {
      console.error('获取用户信息失败:', error.message);
      throw error;
    }
  }

  /**
   * 验证Token服务
   * @param {string} token - JWT Token
   * @returns {Promise} 验证结果
   */
  async verifyToken(token) {
    try {
      const decoded = jwtUtils.verifyToken(token);
      return {
        success: true,
        valid: true,
        user: decoded
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * 刷新Token服务
   * @param {string} token - 旧Token
   * @returns {Promise} 新Token
   */
  async refreshToken(token) {
    try {
      const decoded = jwtUtils.verifyToken(token);
      const newToken = jwtUtils.generateToken({
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role
      });

      return {
        success: true,
        token: newToken
      };
    } catch (error) {
      throw new Error('Token刷新失败');
    }
  }
}

module.exports = AuthService;