const { pool } = require('../config/db');

class BaseModel {
  /**
   * 执行SQL查询
   * @param {string} sql - SQL语句
   * @param {Array} params - 查询参数
   * @returns {Promise} 查询结果
   */
  static async query(sql, params) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 获取指定表的所有记录
   * @param {string} table - 表名
   * @returns {Promise} 查询结果
   */
  static async getAll(table) {
    const sql = `SELECT * FROM ${table}`;
    return this.query(sql);
  }
}

module.exports = BaseModel;