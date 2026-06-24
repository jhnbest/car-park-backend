const BaseModel = require('./baseModel');

class AuditLogModel extends BaseModel {
  static async create(logData) {
    const sql = `
      INSERT INTO "audit_log" (
        "operation_type", "operation_time", "user_id", "user_name",
        "ip_address", "device_info", "user_agent", "operation_details",
        "before_state", "after_state", "operation_result", "error_message",
        "business_id", "business_type", "duration", "extra_data"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      logData.operation_type,
      logData.operation_time || new Date(),
      logData.user_id || null,
      logData.user_name || null,
      logData.ip_address || null,
      logData.device_info || null,
      logData.user_agent || null,
      logData.operation_details ? JSON.stringify(logData.operation_details) : null,
      logData.before_state ? JSON.stringify(logData.before_state) : null,
      logData.after_state ? JSON.stringify(logData.after_state) : null,
      logData.operation_result || 'SUCCESS',
      logData.error_message || null,
      logData.business_id || null,
      logData.business_type || null,
      logData.duration || null,
      logData.extra_data ? JSON.stringify(logData.extra_data) : null
    ];
    return BaseModel.query(sql, params);
  }

  static async find(filters = {}, pagination = { page: 1, pageSize: 20 }) {
    const { page, pageSize } = pagination;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    const params = [];

    if (filters.startTime) {
      conditions.push('"operation_time" >= ?');
      params.push(filters.startTime);
    }
    if (filters.endTime) {
      conditions.push('"operation_time" <= ?');
      params.push(filters.endTime);
    }
    if (filters.userId) {
      conditions.push('"user_id" = ?');
      params.push(filters.userId);
    }
    if (filters.userName) {
      conditions.push('"user_name" LIKE ?');
      params.push(`%${filters.userName}%`);
    }
    if (filters.operationType) {
      conditions.push('"operation_type" = ?');
      params.push(filters.operationType);
    }
    if (filters.ipAddress) {
      conditions.push('"ip_address" LIKE ?');
      params.push(`%${filters.ipAddress}%`);
    }
    if (filters.operationResult) {
      conditions.push('"operation_result" = ?');
      params.push(filters.operationResult);
    }
    if (filters.businessId) {
      conditions.push('"business_id" = ?');
      params.push(filters.businessId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM "audit_log" ${whereClause}`;
    const countResult = await BaseModel.query(countSql, params);
    const total = Number(countResult[0]?.total) || 0;

    const dataSql = `
      SELECT * FROM "audit_log"
      ${whereClause}
      ORDER BY "operation_time" DESC
      LIMIT ? OFFSET ?
    `;
    const data = await BaseModel.query(dataSql, [...params, pageSize, offset]);

    return { data, total, page, pageSize };
  }

  static async getById(id) {
    const sql = `SELECT * FROM "audit_log" WHERE "id" = ?`;
    const result = await BaseModel.query(sql, [id]);
    if (result.length > 0) {
      const log = result[0];
      if (log.operation_details) {
        try { log.operation_details = JSON.parse(log.operation_details); } catch (e) {}
      }
      if (log.before_state) {
        try { log.before_state = JSON.parse(log.before_state); } catch (e) {}
      }
      if (log.after_state) {
        try { log.after_state = JSON.parse(log.after_state); } catch (e) {}
      }
      if (log.extra_data) {
        try { log.extra_data = JSON.parse(log.extra_data); } catch (e) {}
      }
      return log;
    }
    return null;
  }

  static async deleteBefore(beforeDate) {
    const sql = `DELETE FROM "audit_log" WHERE "operation_time" < ?`;
    const result = await BaseModel.query(sql, [beforeDate]);
    const deleteCount = result?.rowsAffected || 0;
    return { deleted: deleteCount };
  }

  static async aggregateByType(startTime, endTime) {
    const sql = `
      SELECT
        "operation_type",
        COUNT(*) as count,
        SUM(CASE WHEN "operation_result" = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN "operation_result" = 'FAIL' THEN 1 ELSE 0 END) as fail_count
      FROM "audit_log"
      WHERE "operation_time" >= ? AND "operation_time" <= ?
      GROUP BY "operation_type"
      ORDER BY count DESC
    `;
    return BaseModel.query(sql, [startTime, endTime]);
  }

  static async aggregateByUser(startTime, endTime, limit = 10) {
    const sql = `
      SELECT
        "user_id",
        "user_name",
        COUNT(*) as operation_count,
        SUM(CASE WHEN "operation_result" = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN "operation_result" = 'FAIL' THEN 1 ELSE 0 END) as fail_count
      FROM "audit_log"
      WHERE "operation_time" >= ? AND "operation_time" <= ?
      GROUP BY "user_id", "user_name"
      ORDER BY operation_count DESC
      LIMIT ?
    `;
    return BaseModel.query(sql, [startTime, endTime, limit]);
  }

  static async getTrend(startTime, endTime, groupBy = 'day') {
    let dateFormat;
    if (groupBy === 'hour') {
      dateFormat = 'YYYY-MM-DD HH24:00';
    } else if (groupBy === 'month') {
      dateFormat = 'YYYY-MM';
    } else {
      dateFormat = 'YYYY-MM-DD';
    }

    const sql = `
      SELECT
        TO_CHAR("operation_time", '${dateFormat}') as date,
        COUNT(*) as count
      FROM "audit_log"
      WHERE "operation_time" >= ? AND "operation_time" <= ?
      GROUP BY TO_CHAR("operation_time", '${dateFormat}')
      ORDER BY date ASC
    `;
    return BaseModel.query(sql, [startTime, endTime]);
  }
}

module.exports = AuditLogModel;
