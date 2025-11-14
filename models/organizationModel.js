const BaseModel = require('./baseModel');

/**
 * 机构数据模型 - 处理机构数据的CRUD操作和同步逻辑
 */
class OrganizationModel extends BaseModel {
  /**
   * 根据父机构ID获取子机构
   * @param {string} superiorOrgan - 父机构ID
   * @returns {Promise} 子机构列表
   */
  static async getByParentId(superiorOrgan) {
    const sql = 'SELECT * FROM organizations WHERE superior_organ = ? ORDER BY sort_no';
    return this.query(sql, [superiorOrgan]);
  }

  /**
   * 获取根级机构（没有上级机构的机构）
   * @returns {Promise} 根级机构列表
   */
  static async getRootOrganizations() {
    const sql = 'SELECT * FROM organizations WHERE superior_organ IS NULL OR superior_organ = \'\' ORDER BY sort_no';
    return this.query(sql);
  }

  /**
   * 根据机构代码获取机构信息
   * @param {string} organCode - 机构代码
   * @returns {Promise} 机构信息
   */
  static async getByCode(organCode) {
    const sql = 'SELECT * FROM organizations WHERE organ_code = ?';
    const result = await this.query(sql, [organCode]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 批量插入或更新机构数据
   * @param {Array} organizations - 机构数据数组
   * @returns {Promise} 批量操作结果
   */
  static async bulkUpsert(organizations) {
    if (!organizations || organizations.length === 0) {
      return [];
    }

    const results = [];
    for (const org of organizations) {
      try {
        // 检查机构是否已存在
        const existingOrg = await this.getById('organizations', org.organ_id);
        
        if (existingOrg) {
          // 更新现有机构
          const updateSql = `
            UPDATE organizations SET 
              organ_code = ?, organ_name = ?, layer_code = ?, superior_organ = ?, 
              manage_organ = ?, name_jp = ?, sort_no = ?, status = ?, 
              changed_date = ?, virtual_flag = ?, full_path = ?, sys_organ_code = ?, 
              sync_time = CURRENT_TIMESTAMP
            WHERE organ_id = ?
          `;
          const updateParams = [
            org.organ_code, org.organ_name, org.layer_code, org.superior_organ,
            org.manage_organ, org.name_jp, org.sort_no, org.status,
            org.changed_date, org.virtual_flag, org.full_path, org.sys_organ_code,
            org.organ_id
          ];
          
          await this.query(updateSql, updateParams);
          results.push({ organ_id: org.organ_id, action: 'updated' });
        } else {
          // 插入新机构
          const insertSql = `
            INSERT INTO organizations (
              organ_id, organ_code, organ_name, layer_code, superior_organ, 
              manage_organ, name_jp, sort_no, status, changed_date, 
              virtual_flag, full_path, sys_organ_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const insertParams = [
            org.organ_id, org.organ_code, org.organ_name, org.layer_code, org.superior_organ,
            org.manage_organ, org.name_jp, org.sort_no, org.status, org.changed_date,
            org.virtual_flag, org.full_path, org.sys_organ_code
          ];
          
          await this.query(insertSql, insertParams);
          results.push({ organ_id: org.organ_id, action: 'inserted' });
        }
      } catch (error) {
        console.error(`处理机构 ${org.organ_id} 时出错:`, error.message);
        results.push({ organ_id: org.organ_id, action: 'error', error: error.message });
      }
    }
    
    return results;
  }

  /**
   * 获取最后一次同步时间
   * @returns {Promise} 最后一次同步时间
   */
  static async getLastSyncTime() {
    const sql = 'SELECT MAX(changed_date) as last_sync_time FROM organizations';
    const result = await this.query(sql);
    return result.length > 0 ? result[0].last_sync_time : null;
  }

  /**
   * 获取机构总数
   * @returns {Promise} 机构总数
   */
  static async getCount() {
    const sql = 'SELECT COUNT(*) as total FROM organizations';
    const result = await this.query(sql);
    return result.length > 0 ? result[0].total : 0;
  }
}

module.exports = OrganizationModel;