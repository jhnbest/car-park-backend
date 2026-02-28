const bcrypt = require('bcryptjs');
const BaseModel = require('./baseModel');
const { generateToken } = require('../utils/jwtUtils');

/**
 * 用户业务模型 - 处理用户相关的业务逻辑
 * 表名：sys_user (原 users)
 */
class UserModel extends BaseModel {
  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} role - 用户角色
   * @returns {Promise} 注册结果
   */
  static async register(username, password, role = 'user') {
    // 检查用户是否已存在
    const existingUsers = await this.findByConditions('sys_user', { username });

    if (existingUsers && existingUsers.length > 0) {
      throw new Error('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入新用户
    await this.insert('sys_user', {
      username,
      password: hashedPassword,
      role
    });

    // 获取新用户信息
    const newUser = await this.findByConditions('sys_user', { username });

    if (!newUser || newUser.length === 0) {
      throw new Error('用户注册失败');
    }

    const user = newUser[0];

    // 生成令牌
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      token
    };
  }

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise} 登录结果
   */
  static async login(username, password) {
    try {
      // 查找用户
      const users = await this.findByConditions('sys_user', { username });

      if (!users || users.length === 0) {
        throw new Error('用户不存在');
      }

      const user = users[0];

      if (!user.password) {
        console.error('数据库密码字段异常 - 用户ID:', user.id);
        console.error('用户对象所有属性:', Object.keys(user));
        throw new Error('用户密码数据异常，请联系管理员');
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('密码错误');
      }

      // 生成令牌
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        token
      };
    } catch (error) {
      console.error('登录过程错误:', error.message);
      throw error;
    }
  }

  /**
   * 获取用户信息（不包含密码）
   * @param {number} id - 用户ID
   * @returns {Promise} 用户信息
   */
  static async getProfile(id) {
    const users = await this.query(
      'SELECT "id", "username", "role", "created_at" FROM "sys_user" WHERE "id" = ?',
      [id]
    );

    return users && users.length > 0 ? users[0] : null;
  }

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {Object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  static async updateProfile(id, data) {
    // 不允许更新密码字段
    if (data.password) {
      delete data.password;
    }

    return this.update('sys_user', id, data);
  }

  /**
   * 更改密码
   * @param {number} id - 用户ID
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   * @returns {Promise} 更改结果
   */
  static async changePassword(id, oldPassword, newPassword) {
    // 获取用户信息
    const user = await this.getById('sys_user', id);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证旧密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new Error('旧密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    return this.update('sys_user', id, { password: hashedPassword });
  }
}

module.exports = UserModel;