const BaseModel = require('./baseModel');

/**
 * 人员数据模型 - 处理人员数据的CRUD操作和同步逻辑
 * 表名：hr_staff (原 STAFFINFO)
 */
class PersonModel extends BaseModel {

  /**
   * 根据EMP_SID获取人员信息
   * @param {number} empSid - 人员业务ID
   * @returns {Promise} 人员信息
   */
  static async getByEmpSid(empSid) {
    const sql = 'SELECT * FROM "hr_staff" WHERE "emp_sid" = ?';
    const result = await this.query(sql, [empSid]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 根据机构ID获取人员
   * @param {string} organId - 机构ID
   * @returns {Promise} 人员列表
   */
  static async getByOrganId(organId) {
    const sql = 'SELECT * FROM "hr_staff" WHERE "organ_id" = ? ORDER BY "staff_rank", "cn_name"';
    return this.query(sql, [organId]);
  }

  /**
   * 根据工号获取人员信息（带机构全称）
   * @param {string} mfId - 人员工号
   * @returns {Promise} 人员信息
   */
  static async findByIdWithOrg(mfId) {
    const sql = `
      SELECT h.*, o."full_path" as "organ_full_path"
      FROM "hr_staff" h
      LEFT JOIN "sys_organization" o ON h."organ_id" = o."organ_id"
      WHERE h."mf_id" = ?
        AND h."emp_type" IN ('在职人员', '协议人员', '外包在职')
    `;
    const result = await this.query(sql, [mfId]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 根据人员姓名模糊查询人员信息（带机构全称）
   * @param {string} name - 人员姓名
   * @returns {Promise} 人员列表
   */
  static async findByNameWithOrg(name) {
    const searchTerm = `%${name}%`;
    const sql = `
      SELECT h.*, o."full_path" as "organ_full_path"
      FROM "hr_staff" h
      LEFT JOIN "sys_organization" o ON h."organ_id" = o."organ_id"
      WHERE (h."cn_name" LIKE ? OR h."smpl_name" LIKE ? OR h."full_name" LIKE ?)
        AND h."emp_type" IN ('在职人员', '协议人员', '外包在职')
      ORDER BY h."cn_name"
    `;
    const result = await this.query(sql, [searchTerm, searchTerm, searchTerm]);
    return result;
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
        const existingPerson = await this.getByEmpSid(person.emp_sid);

        if (existingPerson) {
          const updateSql = `
            UPDATE "hr_staff" SET
              "mf_id" = ?, "cn_name" = ?, "smpl_name" = ?, "full_name" = ?,
              "firstname_en" = ?, "surname_en" = ?, "midname_en" = ?, "gender" = ?,
              "organ_id" = ?, "e0122" = ?, "unit_name" = ?, "dep_name" = ?,
              "office_name" = ?, "emp_type" = ?, "emp_type_nm_new" = ?, "emp_status_nm_new" = ?,
              "typeid" = ?, "work_post" = ?, "post_id" = ?, "job_type" = ?,
              "tel_office" = ?, "ekp_main" = ?, "staff_rank" = ?, "pass_level_name" = ?,
              "organ_post_all" = ?, "changed_date" = ?, "updated_at" = CURRENT_TIMESTAMP
            WHERE "emp_sid" = ?
          `;
          const updateParams = [
            person.mf_id || null, person.cn_name || null, person.smpl_name || null, person.full_name || null,
            person.firstname_en || null, person.surname_en || null, person.midname_en || null, person.gender || null,
            person.organ_id || null, person.e0122 || null, person.unit_name || null, person.dep_name || null,
            person.office_name || null, person.emp_type || null, person.emp_type_nm_new || null, person.emp_status_nm_new || null,
            person.typeid || null, person.work_post || null, person.post_id || null, person.job_type || null,
            person.tel_office || null, person.ekp_main || null, person.staff_rank || null, person.pass_level_name || null,
            person.organ_post_all || null, person.changed_date || null, person.emp_sid
          ];

          await this.query(updateSql, updateParams);
          results.push({ emp_sid: person.emp_sid, mf_id: person.mf_id, action: 'updated' });
        } else {
          const insertSql = `
            INSERT INTO "hr_staff" (
              "emp_sid", "mf_id", "cn_name", "smpl_name", "full_name",
              "firstname_en", "surname_en", "midname_en", "gender",
              "organ_id", "e0122", "unit_name", "dep_name", "office_name",
              "emp_type", "emp_type_nm_new", "emp_status_nm_new", "typeid",
              "work_post", "post_id", "job_type", "tel_office", "ekp_main",
              "staff_rank", "pass_level_name", "organ_post_all", "changed_date"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const insertParams = [
            person.emp_sid, person.mf_id || null, person.cn_name || null, person.smpl_name || null, person.full_name || null,
            person.firstname_en || null, person.surname_en || null, person.midname_en || null, person.gender || null,
            person.organ_id || null, person.e0122 || null, person.unit_name || null, person.dep_name || null, person.office_name || null,
            person.emp_type || null, person.emp_type_nm_new || null, person.emp_status_nm_new || null, person.typeid || null,
            person.work_post || null, person.post_id || null, person.job_type || null, person.tel_office || null, person.ekp_main || null,
            person.staff_rank || null, person.pass_level_name || null, person.organ_post_all || null, person.changed_date || null
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
    const sql = 'SELECT MAX("changed_date") as "last_sync_time" FROM "hr_staff"';
    const result = await this.query(sql);
    return result.length > 0 ? result[0].last_sync_time : null;
  }

  /**
   * 获取人员总数
   * @returns {Promise} 人员总数
   */
  static async getCount() {
    const sql = 'SELECT COUNT(*) as "total" FROM "hr_staff"';
    const result = await this.query(sql);
    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * 根据机构ID获取人员数量
   * @param {string} organId - 机构ID
   * @returns {Promise} 人员数量
   */
  static async getCountByOrganId(organId) {
    const sql = 'SELECT COUNT(*) as "total" FROM "hr_staff" WHERE "organ_id" = ?';
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
        "organ_id",
        COUNT(*) as "person_count",
        COUNT(DISTINCT "emp_type") as "emp_type_count"
      FROM "hr_staff"
      GROUP BY "organ_id"
      ORDER BY "person_count" DESC
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
    const sql = 'SELECT * FROM "hr_staff" WHERE "cn_name" LIKE ? OR "smpl_name" LIKE ? OR "full_name" LIKE ? ORDER BY "cn_name"';
    const result = await this.query(sql, [searchTerm, searchTerm, searchTerm]);
    return result;
  }

  /**
   * 根据人员MfId获取人员信息
   * @param {string} MfId - 人员ID
   * @returns {Promise} 人员信息
   */
  static async findById(MfId) {
    const sql = 'SELECT * FROM "hr_staff" WHERE "mf_id" = ?';
    const result = await this.query(sql, [MfId]);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * 搜索人员数据（带机构全称）
   * @param {string} keyword - 搜索关键词
   * @param {number} page - 页码
   * @param {number} pageSize - 每页大小
   * @returns {Promise} 搜索结果
   */
  static async search(keyword, page = 1, pageSize = 20) {
    const searchTerm = `%${keyword}%`;
    const offset = (page - 1) * pageSize;

    const countSql = `
      SELECT COUNT(*) as total
      FROM "hr_staff"
      WHERE ("cn_name" LIKE ? OR "smpl_name" LIKE ? OR "mf_id" LIKE ?)
        AND "emp_type" IN ('在职人员', '协议人员', '外包在职')
    `;
    const countResult = await this.query(countSql, [searchTerm, searchTerm, searchTerm]);
    const total = countResult[0]?.total || 0;

    const dataSql = `
      SELECT h.*, o."full_path" as "organ_full_path"
      FROM "hr_staff" h
      LEFT JOIN "sys_organization" o ON h."organ_id" = o."organ_id"
      WHERE (h."cn_name" LIKE ? OR h."smpl_name" LIKE ? OR h."mf_id" LIKE ?)
        AND h."emp_type" IN ('在职人员', '协议人员', '外包在职')
      ORDER BY h."cn_name"
      LIMIT ? OFFSET ?
    `;
    const data = await this.query(dataSql, [searchTerm, searchTerm, searchTerm, pageSize, offset]);

    return { data, total };
  }
}

module.exports = PersonModel;
