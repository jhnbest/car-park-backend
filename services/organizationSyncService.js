const OrganizationModel = require('../models/organizationModel');
const { request } = require('../utils/http');

/**
 * 机构数据同步服务
 */
class OrganizationSyncService {
  /**
   * 构造函数
   * @param {string} apiBaseUrl - API基础URL
   */
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl || process.env.ORGANIZATION_API_URL;
  }

  /**
   * 获取机构数据
   * @param {Object} params - 查询参数
   * @returns {Promise} 机构数据
   */
  async fetchOrganizations(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        pageSize: 20,
        VIRTUAL_FLAG: '',
        ORGAN_CODE: '',
        MANAGE_ORGAN: '',
        ORGAN_NAME: '',
        SUPERIOR_ORGAN: '',
        FULL_PATH: '',
        CHANGED_DATE_END: '',
        STATUS: '',
        ORGAN_ID: '',
        LAYER_CODE: '',
        CHANGED_DATE_START: ''
      };

      const requestParams = { ...defaultParams, ...params };
      
      console.log('请求机构数据接口，参数:', requestParams);
      
      // 调用机构数据接口
      const response = await request('post', `${this.apiBaseUrl}/api/organizations`, requestParams);
      
      if (response.code === 200) {
        return response.data || [];
      } else {
        throw new Error(`机构数据接口返回错误: ${response.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('获取机构数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 全量同步机构数据
   * @returns {Promise} 同步结果
   */
  async fullSync() {
    try {
      console.log('开始全量同步机构数据...');
      
      // 获取所有机构数据
      let allOrganizations = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const organizations = await this.fetchOrganizations({ page, pageSize: 100 });
        
        if (organizations && organizations.length > 0) {
          allOrganizations = allOrganizations.concat(organizations);
          console.log(`第${page}页获取到${organizations.length}条机构数据`);
          
          if (organizations.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      console.log(`总共获取到${allOrganizations.length}条机构数据`);

      // 批量插入或更新数据
      const result = await OrganizationModel.bulkUpsert(allOrganizations);
      
      console.log('全量同步完成:', result);
      return {
        success: true,
        total: allOrganizations.length,
        result: result
      };
    } catch (error) {
      console.error('全量同步失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 增量同步机构数据
   * @returns {Promise} 同步结果
   */
  async incrementalSync() {
    try {
      console.log('开始增量同步机构数据...');
      
      // 获取最后一次同步时间
      const lastSyncTime = await OrganizationModel.getLastSyncTime();
      const currentTime = new Date().toISOString().split('T')[0]; // 当前日期
      
      let changedDateStart = lastSyncTime;
      if (!changedDateStart) {
        // 如果没有同步记录，进行全量同步
        console.log('没有找到同步记录，执行全量同步');
        return await this.fullSync();
      }

      // 格式化日期
      if (changedDateStart instanceof Date) {
        changedDateStart = changedDateStart.toISOString().split('T')[0];
      }

      console.log(`增量同步时间范围: ${changedDateStart} 到 ${currentTime}`);

      // 获取增量数据
      let allIncrementalData = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const incrementalData = await this.fetchOrganizations({
          CHANGED_DATE_START: changedDateStart,
          CHANGED_DATE_END: currentTime,
          page,
          pageSize: 100
        });
        
        if (incrementalData && incrementalData.length > 0) {
          allIncrementalData = allIncrementalData.concat(incrementalData);
          console.log(`第${page}页获取到${incrementalData.length}条增量机构数据`);
          
          if (incrementalData.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      console.log(`总共获取到${allIncrementalData.length}条增量机构数据`);

      // 批量更新数据
      const result = await OrganizationModel.bulkUpsert(allIncrementalData);
      
      console.log('增量同步完成:', result);
      return {
        success: true,
        syncType: 'incremental',
        timeRange: `${changedDateStart} 到 ${currentTime}`,
        total: allIncrementalData.length,
        result: result
      };
    } catch (error) {
      console.error('增量同步失败:', error.message);
      return {
        success: false,
        error: error.message
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
        lastSyncTime: lastSyncTime,
        totalOrganizations: totalCount,
        status: 'ready'
      };
    } catch (error) {
      return {
        lastSyncTime: null,
        totalOrganizations: 0,
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = OrganizationSyncService;