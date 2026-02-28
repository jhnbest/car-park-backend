const BaseModel = require('./baseModel');

/**
 * 同步日志模型 - 处理数据同步日志的CRUD操作
 * 表名：sync_log
 */
class SyncLogModel extends BaseModel {

  /**
   * 创建同步日志
   * @param {Object} logData - 日志数据
   * @returns {Promise} 创建结果
   */
  static async create(logData) {
    const sql = `
      INSERT INTO "sync_log" (
        "task_name", "sync_type", "status", "message",
        "total_fetched", "total_processed", "inserted", "updated", "errors",
        "time_range", "duration", "error_detail"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      logData.task_name,
      logData.sync_type,
      logData.status,
      logData.message,
      logData.total_fetched || 0,
      logData.total_processed || 0,
      logData.inserted || 0,
      logData.updated || 0,
      logData.errors || 0,
      logData.time_range || null,
      logData.duration || null,
      logData.error_detail || null
    ];
    return this.query(sql, params);
  }

  /**
   * 获取同步日志列表
   * @param {number} page - 页码
   * @param {number} pageSize - 每页大小
   * @param {string} taskName - 任务名称筛选
   * @returns {Promise} 日志列表
   */
  static async getLogs(page = 1, pageSize = 20, taskName = null) {
    const offset = (page - 1) * pageSize;
    let sql, countSql;

    if (taskName) {
      sql = `
        SELECT * FROM "sync_log"
        WHERE "task_name" = ?
        ORDER BY "created_at" DESC
        LIMIT ? OFFSET ?
      `;
      countSql = `
        SELECT COUNT(*) as total FROM "sync_log" WHERE "task_name" = ?
      `;
      const countResult = await this.query(countSql, [taskName]);
      const total = Number(countResult[0]?.total) || 0;
      const data = await this.query(sql, [taskName, pageSize, offset]);
      return { data, total };
    } else {
      sql = `
        SELECT * FROM "sync_log"
        ORDER BY "created_at" DESC
        LIMIT ? OFFSET ?
      `;
      countSql = `SELECT COUNT(*) as total FROM "sync_log"`;
      const countResult = await this.query(countSql);
      const total = Number(countResult[0]?.total) || 0;
      const data = await this.query(sql, [pageSize, offset]);
      return { data, total };
    }
  }

  /**
   * 获取最近一次同步记录
   * @param {string} taskName - 任务名称
   * @returns {Promise} 最近一次同步记录
   */
  static async getLastSync(taskName) {
    const sql = `
      SELECT * FROM "sync_log"
      WHERE "task_name" = ?
      ORDER BY "created_at" DESC
      LIMIT 1
    `;
    const result = await this.query(sql, [taskName]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 删除指定日期之前的日志
   * @param {string} beforeDate - 日期字符串
   * @returns {Promise} 删除结果
   */
  static async deleteBefore(beforeDate) {
    const sql = `
      DELETE FROM "sync_log"
      WHERE "created_at" < ?
    `;
    return this.query(sql, [beforeDate]);
  }

  /**
   * 更新duration字段，将秒转换为毫秒
   * @returns {Promise} 更新结果
   */
  static async convertDurationToMs() {
    const sql = `
      UPDATE "sync_log"
      SET "duration" = CAST(ROUND(CAST("duration" AS FLOAT) * 1000) AS VARCHAR)
      WHERE "duration" LIKE '%.%'
    `;
    return this.query(sql);
  }
}

module.exports = SyncLogModel;
