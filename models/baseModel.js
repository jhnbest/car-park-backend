const { createConnection, executeQuery } = require('../config/db');

/**
 * 通用基础模型 - 提供标准的CRUD操作
 */
class BaseModel {
  /**
   * 执行SQL查询
   * @param {string} sql - SQL语句
   * @param {Array} params - 查询参数
   * @returns {Promise} 查询结果
   */
  static async query(sql, params = []) {
    const connection = await createConnection();
    try {
      const result = await executeQuery(connection, sql, params);
      return result;
    } finally {
      try {
        await connection.close();
      } catch (closeError) {
        console.warn('连接关闭失败:', closeError.message);
      }
    }
  }

  /**
   * 获取指定表的所有记录
   * @param {string} table - 表名
   * @returns {Promise} 查询结果
   */
  static async getAll(table) {
    const sql = `SELECT * FROM "${table}"`;
    return this.query(sql);
  }

  /**
   * 根据ID获取记录
   * @param {string} table - 表名
   * @param {number} id - 记录ID
   * @param {string} idColumn - ID列名，默认为'id'
   * @returns {Promise} 查询结果
   */
  static async getById(table, id, idColumn = 'id') {
    const sql = `SELECT * FROM "${table}" WHERE "${idColumn}" = ?`;
    const result = await this.query(sql, [id]);
    return result && result.length > 0 ? result[0] : null;
  }

  /**
   * 插入记录
   * @param {string} table - 表名
   * @param {Object} data - 插入数据
   * @returns {Promise} 插入结果
   */
  static async insert(table, data) {
    const columns = Object.keys(data).map(col => `"${col}"`).join(', ');
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(', ');
    
    const sql = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`;
    return this.query(sql, values);
  }

  /**
   * 更新记录
   * @param {string} table - 表名
   * @param {number} id - 记录ID
   * @param {Object} data - 更新数据
   * @param {string} idColumn - ID列名，默认为'id'
   * @returns {Promise} 更新结果
   */
  static async update(table, id, data, idColumn = 'id') {
    const setClause = Object.keys(data)
      .map(col => `"${col}" = ?`)
      .join(', ');
    const values = [...Object.values(data), id];
    
    const sql = `UPDATE "${table}" SET ${setClause} WHERE "${idColumn}" = ?`;
    return this.query(sql, values);
  }

  /**
   * 删除记录
   * @param {string} table - 表名
   * @param {number} id - 记录ID
   * @param {string} idColumn - ID列名，默认为'id'
   * @returns {Promise} 删除结果
   */
  static async delete(table, id, idColumn = 'id') {
    const sql = `DELETE FROM "${table}" WHERE "${idColumn}" = ?`;
    return this.query(sql, [id]);
  }

  /**
   * 条件查询
   * @param {string} table - 表名
   * @param {Object} conditions - 查询条件
   * @returns {Promise} 查询结果
   */
  static async findByConditions(table, conditions) {
    const whereClause = Object.keys(conditions)
      .map(col => `"${col}" = ?`)
      .join(' AND ');
    const values = Object.values(conditions);
    
    const sql = `SELECT * FROM "${table}" WHERE ${whereClause}`;
    return this.query(sql, values);
  }

  /**
   * 分页查询
   * @param {string} table - 表名
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @param {string} orderBy - 排序字段
   * @param {string} order - 排序方式
   * @returns {Promise} 分页结果
   */
  static async paginate(table, page = 1, limit = 10, orderBy = 'id', order = 'ASC') {
    const offset = (page - 1) * limit;
    const sql = `SELECT * FROM "${table}" ORDER BY "${orderBy}" ${order} LIMIT ? OFFSET ?`;
    return this.query(sql, [limit, offset]);
  }

  /**
   * 统计记录数量
   * @param {string} table - 表名
   * @param {Object} conditions - 查询条件
   * @returns {Promise} 记录数量
   */
  static async count(table, conditions = {}) {
    let sql = `SELECT COUNT(*) as count FROM "${table}"`;
    let values = [];
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(col => `"${col}" = ?`)
        .join(' AND ');
      values = Object.values(conditions);
      sql += ` WHERE ${whereClause}`;
    }
    
    const result = await this.query(sql, values);
    return result && result.length > 0 ? result[0].count : 0;
  }
}

module.exports = BaseModel;