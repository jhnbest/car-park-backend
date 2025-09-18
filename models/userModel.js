const bcrypt = require('bcryptjs');
const { createConnection } = require('../config/db');
const { generateToken } = require('../utils/jwtUtils');

class UserModel {
  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} role - 用户角色
   * @returns {Promise} 注册结果
   */
  static async register(username, password, role = 'user') {
    const connection = await createConnection();
    try {
      // 检查用户是否已存在
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );
      
      if (existingUsers.length > 0) {
        throw new Error('用户名已存在');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 插入新用户
      const [result] = await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );

      // 生成令牌
      const token = generateToken({
        id: result.insertId,
        username,
        role
      });

      return {
        id: result.insertId,
        username,
        role,
        token
      };
    } finally {
      await connection.end();
    }
  }

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise} 登录结果
   */
  static async login(username, password) {
    const connection = await createConnection();
    try {
      // 查找用户
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      if (users.length === 0) {
        throw new Error('用户不存在');
      }

      const user = users[0];

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
        id: user.id,
        username: user.username,
        role: user.role,
        token
      };
    } finally {
      await connection.end();
    }
  }

  /**
   * 根据ID获取用户信息
   * @param {number} id - 用户ID
   * @returns {Promise} 用户信息
   */
  static async getById(id) {
    const connection = await createConnection();
    try {
      const [users] = await connection.execute(
        'SELECT id, username, role, created_at FROM users WHERE id = ?',
        [id]
      );
      
      return users[0] || null;
    } finally {
      await connection.end();
    }
  }
}

module.exports = UserModel;