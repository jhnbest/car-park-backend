const OrganizationModel = require('../models/organizationModel');
const SyncLogModel = require('../models/syncLogModel');
const HmacAuthClient = require('../utils/hmacAuthClient');
const { Logger } = require('../services/syncLogger');

/**
 * 机构数据同步服务
 * 从服务治理中心获取机构数据并同步到数据库
 */
class OrganizationSyncService {
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
      organ_id: apiData.ORGAN_ID,
      organ_code: apiData.ORGAN_CODE,
      organ_name: apiData.ORGAN_NAME,
      layer_code: apiData.LAYER_CODE,
      superior_organ: apiData.SUPERIOR_ORGAN,
      manage_organ: apiData.MANAGE_ORGAN,
      name_jp: apiData.NAME_JP,
      sort_no: apiData.SORT_NO,
      status: apiData.STATUS,
      changed_date: apiData.CHANGED_DATE,
      virtual_flag: apiData.VIRTUAL_FLAG,
      full_path: apiData.FULL_PATH,
      sys_organ_code: apiData.SYS_ORGAN_CODE
    };
  }

  /**
   * 从服务治理中心获取机构数据
   * @param {Object} params - 查询参数
   * @returns {Promise} 机构数据列表
   */
  async fetchOrganizations(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        pageSize: 100,
        VIRTUAL_FLAG: '',
        ORGAN_CODE: '',
        MANAGE_ORGAN: '',
        ORGAN_NAME: '',
        SUPERIOR_ORGAN: '',
        FULL_PATH: '',
        CHANGED_DATE_END: '',
        STATUS: 'O',
        ORGAN_ID: '',
        LAYER_CODE: '',
        CHANGED_DATE_START: ''
      };

      const requestParams = { ...defaultParams, ...params };

      Logger.info('OrganizationSync', `请求机构数据接口，参数:`, requestParams);

      const response = await this.client.post('/MD/mdHrA1001', requestParams);

      if (response.code === 200) {
        const data = response.data || [];
        const mappedData = data.map(item => this.mapFields(item));
        Logger.info('OrganizationSync', `获取到 ${mappedData.length} 条机构数据`);
        return mappedData;
      } else {
        throw new Error(`机构数据接口返回错误: ${response.msg || '未知错误'}`);
      }
    } catch (error) {
      Logger.error('OrganizationSync', `获取机构数据失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 全量同步机构数据
   * @returns {Promise} 同步结果
   */
  async fullSync() {
    const taskName = '机构数据全量同步';
    Logger.info('OrganizationSync', `=== 开始 ${taskName} ===`);

    const startTime = Date.now();
    let allOrganizations = [];

    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const organizations = await this.fetchOrganizations({ page, pageSize: 100 });

        if (organizations && organizations.length > 0) {
          allOrganizations = allOrganizations.concat(organizations);
          Logger.info('OrganizationSync', `第${page}页获取到${organizations.length}条机构数据`);

          if (organizations.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      Logger.info('OrganizationSync', `总共获取到${allOrganizations.length}条机构数据`);

      if (allOrganizations.length === 0) {
        const duration = (Date.now() - startTime).toFixed(0);
        const syncResult = {
          taskName,
          success: true,
          message: '机构数据全量同步成功（无数据）',
          details: {
            totalFetched: 0,
            totalProcessed: 0,
            inserted: 0,
            updated: 0,
            errors: 0,
            duration: `${duration}秒`
          }
        };
        Logger.info('OrganizationSync', `${taskName}完成: 无数据可同步`);

        await SyncLogModel.create({
          task_name: 'organizationSync',
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

      const result = await OrganizationModel.bulkUpsert(allOrganizations);

      const duration = (Date.now() - startTime).toFixed(0);
      const syncResult = {
        taskName,
        success: true,
        message: '机构数据全量同步成功',
        details: {
          totalFetched: allOrganizations.length,
          totalProcessed: result.length,
          inserted: result.filter(r => r.action === 'inserted').length,
          updated: result.filter(r => r.action === 'updated').length,
          errors: result.filter(r => r.action === 'error').length,
          duration: `${duration}秒`
        }
      };

      Logger.info('OrganizationSync', `${taskName}完成:`, syncResult);

      await SyncLogModel.create({
        task_name: 'organizationSync',
        sync_type: 'full',
        status: 'success',
        message: syncResult.message,
        total_fetched: allOrganizations.length,
        total_processed: result.length,
        inserted: result.filter(r => r.action === 'inserted').length,
        updated: result.filter(r => r.action === 'updated').length,
        errors: result.filter(r => r.action === 'error').length,
        duration: duration
      });

      return syncResult;

    } catch (error) {
      const duration = (Date.now() - startTime).toFixed(0);
      Logger.error('OrganizationSync', `${taskName}失败: ${error.message}`);

      await SyncLogModel.create({
        task_name: 'organizationSync',
        sync_type: 'full',
        status: 'failed',
        message: `机构数据全量同步失败: ${error.message}`,
        error_detail: error.stack,
        duration: duration
      });

      return {
        taskName,
        success: false,
        message: `机构数据全量同步失败: ${error.message}`,
        error: error,
        details: {
          duration: `${duration}秒`
        }
      };
    }
  }

  /**
   * 增量同步机构数据
   * @returns {Promise} 同步结果
   */
  async incrementalSync() {
    const taskName = '机构数据增量同步';
    Logger.info('OrganizationSync', `=== 开始 ${taskName} ===`);

    const startTime = Date.now();

    try {
      const lastSyncTime = await OrganizationModel.getLastSyncTime();
      const currentDate = new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });

      let changedDateStart = lastSyncTime;
      if (!changedDateStart) {
        Logger.warn('OrganizationSync', '没有找到同步记录，执行全量同步');
        return await this.fullSync();
      }

      if (changedDateStart instanceof Date) {
        changedDateStart = changedDateStart.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
      }

      const lastSyncDate = new Date(changedDateStart);
      const nextDay = new Date(lastSyncDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const startDate = nextDay.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });

      Logger.info('OrganizationSync', `增量同步时间范围: ${startDate} 到 ${currentDate} (上次同步日期: ${changedDateStart})`);

      let allIncrementalData = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const incrementalData = await this.fetchOrganizations({
          CHANGED_DATE_START: startDate,
          CHANGED_DATE_END: currentDate,
          page,
          pageSize: 100
        });

        if (incrementalData && incrementalData.length > 0) {
          allIncrementalData = allIncrementalData.concat(incrementalData);
          Logger.info('OrganizationSync', `第${page}页获取到${incrementalData.length}条增量机构数据`);

          if (incrementalData.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      Logger.info('OrganizationSync', `总共获取到${allIncrementalData.length}条增量机构数据`);

      if (allIncrementalData.length === 0) {
        const duration = (Date.now() - startTime).toFixed(0);
        const syncResult = {
          taskName,
          success: true,
          message: '机构数据增量同步成功（无数据）',
          details: {
            timeRange: `${startDate} 到 ${currentDate}`,
            totalFetched: 0,
            totalProcessed: 0,
            inserted: 0,
            updated: 0,
            errors: 0,
            duration: `${duration}秒`
          }
        };
        Logger.info('OrganizationSync', `${taskName}完成: 无数据可同步`);

        await SyncLogModel.create({
          task_name: 'organizationSync',
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

      const result = await OrganizationModel.bulkUpsert(allIncrementalData);

      const duration = (Date.now() - startTime).toFixed(0);
      const syncResult = {
        taskName,
        success: true,
        message: '机构数据增量同步成功',
        details: {
          timeRange: `${startDate} 到 ${currentDate}`,
          totalFetched: allIncrementalData.length,
          totalProcessed: result.length,
          inserted: result.filter(r => r.action === 'inserted').length,
          updated: result.filter(r => r.action === 'updated').length,
          errors: result.filter(r => r.action === 'error').length,
          duration: `${duration}秒`
        }
      };

      Logger.info('OrganizationSync', `${taskName}完成:`, syncResult);

      await SyncLogModel.create({
        task_name: 'organizationSync',
        sync_type: 'incremental',
        status: 'success',
        message: syncResult.message,
        time_range: `${startDate} 到 ${currentDate}`,
        total_fetched: allIncrementalData.length,
        total_processed: result.length,
        inserted: result.filter(r => r.action === 'inserted').length,
        updated: result.filter(r => r.action === 'updated').length,
        errors: result.filter(r => r.action === 'error').length,
        duration: duration
      });

      return syncResult;

    } catch (error) {
      const duration = (Date.now() - startTime).toFixed(0);
      Logger.error('OrganizationSync', `${taskName}失败: ${error.message}`);

      await SyncLogModel.create({
        task_name: 'organizationSync',
        sync_type: 'incremental',
        status: 'failed',
        message: `机构数据增量同步失败: ${error.message}`,
        error_detail: error.stack,
        duration: duration
      });

      return {
        taskName,
        success: false,
        message: `机构数据增量同步失败: ${error.message}`,
        error: error,
        details: {
          duration: `${duration}秒`
        }
      };
    }
  }

  /**
   * 检查同步状态
   * @returns {Promise} 同步状态信息
   */
  async checkSyncStatus() {
    try {
      const lastSyncTime = await OrganizationModel.getLastSyncTime();
      const totalCount = await OrganizationModel.getCount();

      return {
        success: true,
        lastSyncTime,
        totalOrganizations: totalCount,
        status: 'ready'
      };
    } catch (error) {
      return {
        success: false,
        lastSyncTime: null,
        totalOrganizations: 0,
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = OrganizationSyncService;
