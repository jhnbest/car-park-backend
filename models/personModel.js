const BaseModel = require('./baseModel');

/**
 * 人员数据模型 - 处理人员数据的CRUD操作和同步逻辑
 */
class PersonModel extends BaseModel {

  /**
   * 根据机构ID获取人员
   * @param {string} organId - 机构ID
   * @returns {Promise} 人员列表
   */
  static async getByOrganId(organId) {
    const sql = 'SELECT * FROM persons WHERE organ_id = ? ORDER BY staff_rank, cn_name';
    return this.query(sql, [organId]);
  }

  /**
   * 批量插入或更新人员数据
   * @param {Array} persons - 人员数据数组
   * @returns {Promise} 批量操作结果
   */
  static async bulkUpsert(persons) {
    if (!persons || persons.length === 0) {
      return [];
    }

    const results = [];
    for (const person of persons) {
      try {
        // 检查人员是否已存在
        const existingPerson = await this.getById('persons', person.emp_sid);
        
        if (existingPerson) {
          // 更新现有人员
          const updateSql = `
            UPDATE persons SET 
              mf_id = ?, cn_name = ?, smpl_name = ?, full_name = ?, 
              firstname_en = ?, surname_en = ?, midname_en = ?, gender = ?, 
              organ_id = ?, e0122 = ?, unit_name = ?, dep_name = ?, 
              office_name = ?, emp_type = ?, emp_type_nm_new = ?, emp_status_nm_new = ?, 
              typeid = ?, work_post = ?, post_id = ?, job_type = ?, 
              tel_office = ?, ekp_main = ?, staff_rank = ?, pass_level_name = ?, 
              organ_post_all = ?, changed_date = ?, sync_time = CURRENT_TIMESTAMP
            WHERE emp_sid = ?
          `;
          const updateParams = [
            person.mf_id, person.cn_name, person.smpl_name, person.full_name,
            person.firstname_en, person.surname_en, person.midname_en, person.gender,
            person.organ_id, person.e0122, person.unit_name, person.dep_name,
            person.office_name, person.emp_type, person.emp_type_nm_new, person.emp_status_nm_new,
            person.typeid, person.work_post, person.post_id, person.job_type,
            person.tel_office, person.ekp_main, person.staff_rank, person.pass_level_name,
            person.organ_post_all, person.changed_date, person.emp_sid
          ];
          
          await this.query(updateSql, updateParams);
          results.push({ emp_sid: person.emp_sid, mf_id: person.mf_id, action: 'updated' });
        } else {
          // 插入新人员
          const insertSql = `
            INSERT INTO persons (
              emp_sid, mf_id, cn_name, smpl_name, full_name, 
              firstname_en, surname_en, midname_en, gender, 
              organ_id, e0122, unit_name, dep_name, office_name, 
              emp_type, emp_type_nm_new, emp_status_nm_new, typeid, 
              work_post, post_id, job_type, tel_office, ekp_main, 
              staff_rank, pass_level_name, organ_post_all, changed_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const insertParams = [
            person.emp_sid, person.mf_id, person.cn_name, person.smpl_name, person.full_name,
            person.firstname_en, person.surname_en, person.midname_en, person.gender,
            person.organ_id, person.e0122, person.unit_name, person.dep_name, person.office_name,
            person.emp_type, person.emp_type_nm_new, person.emp_status_nm_new, person.typeid,
            person.work_post, person.post_id, person.job_type, person.tel_office, person.ekp_main,
            person.staff_rank, person.pass_level_name, person.organ_post_all, person.changed_date
          ];
          
          await this.query(insertSql, insertParams);
          results.push({ emp_sid: person.emp_sid, mf_id: person.mf_id, action: 'inserted' });
        }
      } catch (error) {
        console.error(`处理人员 ${person.emp_sid} (${person.cn_name}) 时出错:`, error.message);
        results.push({ emp_sid: person.emp_sid, mf_id: person.mf_id, action: 'error', error: error.message });
      }
    }
    
    return results;
  }

  /**
   * 获取最后一次同步时间
   * @returns {Promise} 最后一次同步时间
   */
  static async getLastSyncTime() {
    const sql = 'SELECT MAX(changed_date) as last_sync_time FROM persons';
    const result = await this.query(sql);
    return result.length > 0 ? result[0].last_sync_time : null;
  }

  /**
   * 获取人员总数
   * @returns {Promise} 人员总数
   */
  static async getCount() {
    const sql = 'SELECT COUNT(*) as total FROM persons';
    const result = await this.query(sql);
    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * 根据机构ID获取人员数量
   * @param {string} organId - 机构ID
   * @returns {Promise} 人员数量
   */
  static async getCountByOrganId(organId) {
    const sql = 'SELECT COUNT(*) as total FROM persons WHERE organ_id = ?';
    const result = await this.query(sql, [organId]);
    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * 获取人员统计信息（按机构分组）
   * @returns {Promise} 人员统计信息
   */
  static async getStatistics() {
    const sql = `
      SELECT 
        organ_id,
        COUNT(*) as person_count,
        COUNT(DISTINCT emp_type) as emp_type_count
      FROM persons 
      GROUP BY organ_id
      ORDER BY person_count DESC
    `;
    return this.query(sql);
  }

  /**
   * 根据人员姓名模糊查询人员信息
   * @param {string} name - 人员姓名
   * @returns {Promise} 人员列表
   */
  static async findByName(name) {
    const searchTerm = `%${name}%`;
    const sql = 'SELECT * FROM STAFFINFO WHERE CN_NAME LIKE ? OR SMPL_NAME LIKE ? OR FULL_NAME LIKE ? ORDER BY cn_name';
    const result = await this.query(sql, [searchTerm, searchTerm, searchTerm]);
    return result;
  }

  /**
   * 根据人员MfId获取人员信息
   * @param {string} MfId - 人员ID
   * @returns {Promise} 人员信息
   */
  static async findById(MfId) {
    const sql = 'SELECT * FROM STAFFINFO WHERE MF_ID = ?';
    const result = await this.query(sql, [MfId]);
    return result.length > 0 ? result[0] : null;
  }
}

module.exports = PersonModel;