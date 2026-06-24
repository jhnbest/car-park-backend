const BaseModel = require('./baseModel');

/**
 * 权限申请表模型 - 处理权限申请数据的CRUD操作
 * 表名：park_staff_permission_apply
 */
class PermissionApplyModel extends BaseModel {
  /**
   * 根据申请ID获取申请信息
   * @param {string} applyId - 申请ID
   * @returns {Promise} 申请信息
   */
  static async findByApplyId(applyId) {
    const sql = `SELECT * FROM "JHN"."park_staff_permission_apply" WHERE "apply_id" = ?`;
    const result = await this.query(sql, [applyId]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 根据流程ID获取申请信息
   * @param {string} processId - 流程ID
   * @returns {Promise} 申请信息
   */
  static async findByProcessId(processId) {
    const sql = `SELECT * FROM "JHN"."park_staff_permission_apply" WHERE "process_id" = ?`;
    const result = await this.query(sql, [processId]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 根据员工ID获取申请历史
   * @param {string} empId - 员工ID
   * @param {number} pageNo - 页码
   * @param {number} pageSize - 每页大小
   * @returns {Promise} 申请列表
   */
  static async findByEmpId(empId, pageNo = 1, pageSize = 10) {
    const offset = (pageNo - 1) * pageSize;
    const sql = `
      SELECT * FROM "JHN"."park_staff_permission_apply" 
      WHERE "emp_id" = ?
      ORDER BY "create_time" DESC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `;
    return this.query(sql, [empId]);
  }

  /**
   * 获取所有待审批的申请
   * @returns {Promise} 待审批申请列表
   */
  static async findPending() {
    const sql = `
      SELECT * FROM "JHN"."park_staff_permission_apply" 
      WHERE "status" = 'pending'
      ORDER BY "create_time" DESC
    `;
    return this.query(sql);
  }

  /**
   * 根据状态获取申请列表
   * @param {string} status - 状态
   * @returns {Promise} 申请列表
   */
  static async findByStatus(status) {
    const sql = `
      SELECT * FROM "JHN"."park_staff_permission_apply" 
      WHERE "status" = ?
      ORDER BY "create_time" DESC
    `;
    return this.query(sql, [status]);
  }

  /**
   * 创建申请记录
   * @param {Object} applyData - 申请数据
   * @returns {Promise} 创建结果
   */
  static async create(applyData) {
    const sql = `
      INSERT INTO "JHN"."park_staff_permission_apply" (
        "apply_id", "emp_id", "emp_name", "park_id", "park_name", 
        "apply_type", "credential_no", "mobile", "remark", "status", "create_time"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', GETDATE())
    `;
    const params = [
      applyData.applyId,
      applyData.empId,
      applyData.empName,
      applyData.parkId,
      applyData.parkName,
      applyData.applyType,
      applyData.credentialNo || '',
      applyData.mobile || '',
      applyData.remark || ''
    ];
    return this.query(sql, params);
  }

  /**
   * 更新申请状态
   * @param {string} applyId - 申请ID
   * @param {string} status - 新状态
   * @param {string} processId - 流程ID（可选）
   * @returns {Promise} 更新结果
   */
  static async updateStatus(applyId, status, processId = null) {
    let sql = `UPDATE "JHN"."park_staff_permission_apply" SET "status" = ?`;
    const params = [status];

    if (processId) {
      sql += `, "process_id" = ?`;
      params.push(processId);
    }

    sql += `, "update_time" = GETDATE() WHERE "apply_id" = ?`;
    params.push(applyId);

    return this.query(sql, params);
  }

  /**
   * 分页查询申请历史
   * @param {Object} queryParams - 查询参数
   * @returns {Promise} 查询结果
   */
  static async searchApplyHistory(queryParams) {
    const { empId, status, startDate, endDate, pageNo = 1, pageSize = 10 } = queryParams;
    const offset = (pageNo - 1) * pageSize;

    let whereClause = '1=1';
    const params = [];

    if (empId) {
      whereClause += ' AND "emp_id" = ?';
      params.push(empId);
    }

    if (status) {
      whereClause += ' AND "status" = ?';
      params.push(status);
    }

    if (startDate) {
      whereClause += ' AND "create_time" >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND "create_time" <= ?';
      params.push(endDate);
    }

    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM "JHN"."park_staff_permission_apply" 
      WHERE ${whereClause}
    `;
    const countResult = await this.query(countSql, params);
    const total = countResult[0]?.total || 0;

    // 获取分页数据
    const dataSql = `
      SELECT * FROM "JHN"."park_staff_permission_apply" 
      WHERE ${whereClause}
      ORDER BY "create_time" DESC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `;
    const data = await this.query(dataSql, params);

    return {
      data,
      total,
      pageNo,
      pageSize
    };
  }

  /**
   * 获取园区列表
   * @returns {Promise} 园区列表
   */
  static async getParks() {
    const sql = `
      SELECT 
        "id", "park_name", "park_id", "area", "address", 
        "contact", "contact_phone", "status" 
      FROM "JHN"."park_info" 
      WHERE "status" = '1' 
      ORDER BY "id"
    `;
    return this.query(sql);
  }

  /**
   * 验证员工信息
   * @param {string} empId - 员工工号
   * @returns {Promise} 员工信息
   */
  static async validateEmployee(empId) {
    const sql = `
      SELECT TOP 1 
        "mf_id", "cn_name", "dep_name", "emp_status_nm_new", "work_post"
      FROM "JHN"."hr_staff" 
      WHERE "mf_id" = ?
    `;
    const result = await this.query(sql, [empId]);
    return result.length > 0 ? result[0] : null;
  }
}

module.exports = PermissionApplyModel;
