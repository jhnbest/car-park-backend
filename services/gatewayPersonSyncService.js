const PersonModel = require('../models/personModel');
const SyncLogModel = require('../models/syncLogModel');
const HmacAuthClient = require('../utils/hmacAuthClient');
const { Logger } = require('../services/syncLogger');

/**
 * 人员数据同步服务
 * 从服务治理中心获取人员数据并同步到数据库
 */
class PersonSyncService {
  /**
   * 构造函数
   * @param {Object} config - 服务配置
   */
  constructor(config = {}) {
    this.apiBaseUrl = config.apiBaseUrl || process.env.GATEWAY_API_URL;
    this.client = new HmacAuthClient({
      baseURL: this.apiBaseUrl,
      username: config.username || process.env.GATEWAY_HMAC_USERNAME,
      secret: config.secret || process.env.GATEWAY_HMAC_SECRET
    });
  }

  /**
   * 将API返回的大写字段转换为数据库用的小写snake_case字段
   * @param {Object} apiData - API返回的原始数据
   * @returns {Object} 转换后的数据
   */
  mapFields(apiData) {
    return {
      emp_sid: apiData.EMP_SID,
      mf_id: apiData.MF_ID,
      cn_name: apiData.CN_NAME,
      smpl_name: apiData.SMPL_NAME,
      full_name: apiData.FULL_NAME,
      firstname_en: apiData.FIRSTNAME_EN,
      surname_en: apiData.SURNAME_EN,
      midname_en: apiData.MIDNAME_EN,
      gender: apiData.GENDER,
      organ_id: apiData.ORGAN_ID,
      e0122: apiData.E0122,
      unit_name: apiData.UNIT_NAME,
      dep_name: apiData.DEP_NAME,
      office_name: apiData.OFFICE_NAME,
      emp_type: apiData.EMP_TYPE,
      emp_type_nm_new: apiData.EMP_TYPE_NM_NEW,
      emp_status_nm_new: apiData.EMP_STATUS_NM_NEW,
      typeid: apiData.TYPEID,
      work_post: apiData.WORK_POST,
      post_id: apiData.POST_ID,
      job_type: apiData.JOB_TYPE,
      tel_office: apiData.TEL_OFFICE,
      ekp_main: apiData.EKP_MAIN,
      staff_rank: apiData.STAFF_RANK,
      pass_level_name: apiData.PASS_LEVEL_NAME,
      organ_post_all: apiData.ORGAN_POST_ALL,
      changed_date: apiData.CHANGED_DATE
    };
  }

  /**
   * 从服务治理中心获取人员数据
   * @param {Object} params - 查询参数
   * @returns {Promise} 人员数据列表
   */
  async fetchPersons(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        pageSize: 100,
        CHANGED_DATE: '',
        UNIT_NAME: '',
        FULL_NAME: '',
        GENDER: '',
        MF_IDS: '',
        DEP_NAME: '',
        OFFICE_NAME: '',
        CHANGED_DATE_START: '',
        MF_ID: '',
        EMP_TYPE_NM_NEW: '',
        PASS_LEVEL_NAME: '',
        E0122: '',
        CN_NAME: '',
        EMP_TYPE: '',
        CN_NAME_LIKE: '',
        ORGAN_POST_ALL: '',
        CHANGED_DATE_END: '',
        DATA_COUNT: '',
        ORGAN_IDS: '',
        STAFF_RANK: '',
        EMP_STATUS_NM_NEW: '',
        ORGAN_ID: '',
        SMPL_NAME: ''
      };

      const requestParams = { ...defaultParams, ...params };

      Logger.info('PersonSync', `请求人员数据接口，参数:`, requestParams);

      const response = await this.client.post('/MD/mdHrEmpInfoL1_test', requestParams);

      if (response.code === 200) {
        const data = response.data || [];
        const mappedData = data.map(item => this.mapFields(item));
        Logger.info('PersonSync', `获取到 ${mappedData.length} 条人员数据`);
        return mappedData;
      } else {
        throw new Error(`人员数据接口返回错误: ${response.msg || '未知错误'}`);
      }
    } catch (error) {
      Logger.error('PersonSync', `获取人员数据失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 全量同步人员数据
   * @returns {Promise} 同步结果
   */
  async fullSync() {
    const taskName = '人员数据全量同步';
    Logger.info('PersonSync', `=== 开始 ${taskName} ===`);

    const startTime = Date.now();
    let totalPersons = 0;

    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        Logger.info('PersonSync', `正在同步第 ${page} 页人员数据...`);

        const persons = await this.fetchPersons({ page, pageSize: 100 });

        if (persons && persons.length > 0) {
          const results = await PersonModel.bulkUpsert(persons);
          totalPersons += persons.length;

          Logger.info('PersonSync', `第 ${page} 页同步完成: ${persons.length} 条记录`, {
            inserted: results.filter(r => r.action === 'inserted').length,
            updated: results.filter(r => r.action === 'updated').length,
            errors: results.filter(r => r.action === 'error').length
          });

          if (persons.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      if (totalPersons === 0) {
        const duration = (Date.now() - startTime).toFixed(0);
        const syncResult = {
          taskName,
          success: true,
          message: '人员数据全量同步成功（无数据）',
          details: {
            totalSynced: 0,
            duration: `${duration}秒`
          }
        };
        Logger.info('PersonSync', `${taskName}完成: 无数据可同步`);

        await SyncLogModel.create({
          task_name: 'personSync',
          sync_type: 'full',
          status: 'success',
          message: syncResult.message,
          total_fetched: 0,
          total_processed: 0,
          inserted: 0,
          updated: 0,
          errors: 0,
          duration: duration
        });

        return syncResult;
      }

      const finalCount = await PersonModel.getCount();

      const duration = (Date.now() - startTime).toFixed(0);
      const syncResult = {
        taskName,
        success: true,
        message: '人员数据全量同步成功',
        details: {
          totalSynced: totalPersons,
          finalCount: finalCount,
          duration: `${duration}秒`
        }
      };

      Logger.info('PersonSync', `${taskName}完成:`, syncResult);

      await SyncLogModel.create({
        task_name: 'personSync',
        sync_type: 'full',
        status: 'success',
        message: syncResult.message,
        total_fetched: totalPersons,
        total_processed: totalPersons,
        duration: duration
      });

      return syncResult;

    } catch (error) {
      const duration = (Date.now() - startTime).toFixed(0);
      Logger.error('PersonSync', `${taskName}失败: ${error.message}`);

      await SyncLogModel.create({
        task_name: 'personSync',
        sync_type: 'full',
        status: 'failed',
        message: `人员数据全量同步失败: ${error.message}`,
        error_detail: error.stack,
        duration: duration
      });

      return {
        taskName,
        success: false,
        message: `人员数据全量同步失败: ${error.message}`,
        error: error,
        details: {
          totalSynced: totalPersons,
          duration: `${duration}秒`
        }
      };
    }
  }

  /**
   * 增量同步人员数据
   * @returns {Promise} 同步结果
   */
  async incrementalSync() {
    const taskName = '人员数据增量同步';
    Logger.info('PersonSync', `=== 开始 ${taskName} ===`);

    const startTime = Date.now();
    let totalPersons = 0;

    try {
      const lastSyncTime = await PersonModel.getLastSyncTime();
      const currentDate = new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });

      if (!lastSyncTime) {
        Logger.warn('PersonSync', '没有找到同步记录，执行全量同步');
        return await this.fullSync();
      }

      let changedDateStart = lastSyncTime;
      if (changedDateStart instanceof Date) {
        changedDateStart = changedDateStart.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
      }

      const lastSyncDate = new Date(changedDateStart);
      const nextDay = new Date(lastSyncDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const startDate = nextDay.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });

      Logger.info('PersonSync', `增量同步时间范围: ${startDate} 到 ${currentDate} (上次同步日期: ${changedDateStart})`);

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        Logger.info('PersonSync', `正在增量同步第 ${page} 页人员数据...`);

        const persons = await this.fetchPersons({
          page,
          pageSize: 100,
          CHANGED_DATE_START: startDate,
          CHANGED_DATE_END: currentDate
        });

        if (persons && persons.length > 0) {
          const results = await PersonModel.bulkUpsert(persons);
          totalPersons += persons.length;

          Logger.info('PersonSync', `第 ${page} 页增量同步完成: ${persons.length} 条记录`, {
            inserted: results.filter(r => r.action === 'inserted').length,
            updated: results.filter(r => r.action === 'updated').length,
            errors: results.filter(r => r.action === 'error').length
          });

          if (persons.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      if (totalPersons === 0) {
        const duration = (Date.now() - startTime).toFixed(0);
        const syncResult = {
          taskName,
          success: true,
          message: '人员数据增量同步成功（无数据）',
          details: {
            timeRange: `${startDate} 到 ${currentDate}`,
            totalSynced: 0,
            duration: `${duration}秒`
          }
        };
        Logger.info('PersonSync', `${taskName}完成: 无数据可同步`);

        await SyncLogModel.create({
          task_name: 'personSync',
          sync_type: 'incremental',
          status: 'success',
          message: syncResult.message,
          time_range: `${startDate} 到 ${currentDate}`,
          total_fetched: 0,
          total_processed: 0,
          inserted: 0,
          updated: 0,
          errors: 0,
          duration: duration
        });

        return syncResult;
      }

      const finalCount = await PersonModel.getCount();

      const duration = (Date.now() - startTime).toFixed(0);
      const syncResult = {
        taskName,
        success: true,
        message: '人员数据增量同步成功',
        details: {
          timeRange: `${startDate} 到 ${currentDate}`,
          totalSynced: totalPersons,
          finalCount: finalCount,
          duration: `${duration}秒`
        }
      };

      Logger.info('PersonSync', `${taskName}完成:`, syncResult);

      await SyncLogModel.create({
        task_name: 'personSync',
        sync_type: 'incremental',
        status: 'success',
        message: syncResult.message,
        time_range: `${startDate} 到 ${currentDate}`,
        total_fetched: totalPersons,
        total_processed: totalPersons,
        duration: duration
      });

      return syncResult;

    } catch (error) {
      const duration = (Date.now() - startTime).toFixed(0);
      Logger.error('PersonSync', `${taskName}失败: ${error.message}`);

      await SyncLogModel.create({
        task_name: 'personSync',
        sync_type: 'incremental',
        status: 'failed',
        message: `人员数据增量同步失败: ${error.message}`,
        error_detail: error.stack,
        duration: duration
      });

      return {
        taskName,
        success: false,
        message: `人员数据增量同步失败: ${error.message}`,
        error: error,
        details: {
          totalSynced: totalPersons,
          duration: `${duration}秒`
        }
      };
    }
  }

  /**
   * 根据机构ID同步人员数据
   * @param {string} organId - 机构ID
   * @returns {Promise} 同步结果
   */
  async syncByOrganId(organId) {
    const taskName = `机构${organId}人员数据同步`;
    Logger.info('PersonSync', `=== 开始 ${taskName} ===`);

    const startTime = Date.now();
    let totalPersons = 0;

    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        Logger.info('PersonSync', `正在同步机构 ${organId} 的第 ${page} 页人员数据...`);

        const persons = await this.fetchPersons({
          page,
          pageSize: 100,
          ORGAN_ID: organId
        });

        if (persons && persons.length > 0) {
          const results = await PersonModel.bulkUpsert(persons);
          totalPersons += persons.length;

          Logger.info('PersonSync', `机构 ${organId} 第 ${page} 页同步完成: ${persons.length} 条记录`);
          page++;
        } else {
          hasMore = false;
        }
      }

      const organCount = await PersonModel.getCountByOrganId(organId);

      const duration = (Date.now() - startTime).toFixed(0);
      const syncResult = {
        taskName,
        success: true,
        message: `机构 ${organId} 人员数据同步成功`,
        details: {
          organId,
          totalSynced: totalPersons,
          organCount: organCount,
          duration: `${duration}秒`
        }
      };

      Logger.info('PersonSync', `${taskName}完成:`, syncResult);
      return syncResult;

    } catch (error) {
      const duration = (Date.now() - startTime).toFixed(0);
      Logger.error('PersonSync', `${taskName}失败: ${error.message}`);

      return {
        taskName,
        success: false,
        message: `机构 ${organId} 人员数据同步失败: ${error.message}`,
        error: error,
        details: {
          organId,
          totalSynced: totalPersons,
          duration: `${duration}秒`
        }
      };
    }
  }

  /**
   * 获取同步状态
   * @returns {Promise} 同步状态信息
   */
  async getSyncStatus() {
    try {
      const totalCount = await PersonModel.getCount();
      const lastSyncTime = await PersonModel.getLastSyncTime();

      return {
        success: true,
        totalCount,
        lastSyncTime,
        message: '同步状态获取成功'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '获取同步状态失败'
      };
    }
  }
}

module.exports = PersonSyncService;
