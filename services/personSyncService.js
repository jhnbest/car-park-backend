const PersonModel = require('../models/personModel');
const http = require('../utils/http');

/**
 * 人员数据同步服务 - 实现人员数据的全量和增量同步
 */
class PersonSyncService {
  /**
   * 构造函数
   * @param {string} apiUrl - 人员数据接口URL
   */
  constructor(apiUrl = process.env.PERSON_API_URL) {
    this.apiUrl = apiUrl;
  }

  /**
   * 全量同步人员数据
   * @returns {Promise} 同步结果
   */
  async fullSync() {
    console.log('开始全量同步人员数据...');
    
    try {
      // 创建人员表
      await PersonModel.createTable();
      
      // 构建请求参数
      const requestData = {
        pageSize: 1000,
        page: 1,
        CHANGED_DATE_START: '',
        CHANGED_DATE_END: '',
        // 其他参数保持为空
      };
      
      let totalPersons = 0;
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        console.log(`正在同步第 ${page} 页人员数据...`);
        
        requestData.page = page;
        const response = await http.post(this.apiUrl, requestData);
        
        if (response.data && Array.isArray(response.data)) {
          const persons = response.data;
          
          if (persons.length === 0) {
            hasMore = false;
            console.log('所有人员数据同步完成');
          } else {
            // 批量插入或更新人员数据
            const results = await PersonModel.bulkUpsert(persons);
            totalPersons += persons.length;
            
            console.log(`第 ${page} 页同步完成: ${persons.length} 条记录`);
            console.log(`操作结果: 插入 ${results.filter(r => r.action === 'inserted').length} 条, 更新 ${results.filter(r => r.action === 'updated').length} 条`);
            
            page++;
          }
        } else {
          hasMore = false;
          console.error('接口返回数据格式异常:', response);
        }
      }
      
      const finalCount = await PersonModel.getCount();
      console.log(`人员数据全量同步完成，总计 ${totalPersons} 条记录，数据库现有 ${finalCount} 条记录`);
      
      return {
        success: true,
        totalSynced: totalPersons,
        finalCount: finalCount,
        message: '人员数据全量同步完成'
      };
    } catch (error) {
      console.error('人员数据全量同步失败:', error.message);
      return {
        success: false,
        error: error.message,
        message: '人员数据全量同步失败'
      };
    }
  }

  /**
   * 增量同步人员数据
   * @returns {Promise} 同步结果
   */
  async incrementalSync() {
    console.log('开始增量同步人员数据...');
    
    try {
      // 获取最后一次同步时间
      const lastSyncTime = await PersonModel.getLastSyncTime();
      const currentDate = new Date().toISOString().split('T')[0];
      
      console.log(`最后一次同步时间: ${lastSyncTime || '无记录'}`);
      console.log(`当前日期: ${currentDate}`);
      
      // 构建增量同步请求参数
      const requestData = {
        pageSize: 1000,
        page: 1,
        CHANGED_DATE_START: lastSyncTime || '2000-01-01',
        CHANGED_DATE_END: currentDate,
        // 其他参数保持为空
      };
      
      let totalPersons = 0;
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        console.log(`正在增量同步第 ${page} 页人员数据...`);
        
        requestData.page = page;
        const response = await http.post(this.apiUrl, requestData);
        
        if (response.data && Array.isArray(response.data)) {
          const persons = response.data;
          
          if (persons.length === 0) {
            hasMore = false;
            console.log('增量人员数据同步完成');
          } else {
            // 批量插入或更新人员数据
            const results = await PersonModel.bulkUpsert(persons);
            totalPersons += persons.length;
            
            console.log(`第 ${page} 页增量同步完成: ${persons.length} 条记录`);
            console.log(`操作结果: 插入 ${results.filter(r => r.action === 'inserted').length} 条, 更新 ${results.filter(r => r.action === 'updated').length} 条`);
            
            page++;
          }
        } else {
          hasMore = false;
          console.error('接口返回数据格式异常:', response);
        }
      }
      
      const finalCount = await PersonModel.getCount();
      console.log(`人员数据增量同步完成，本次同步 ${totalPersons} 条记录，数据库现有 ${finalCount} 条记录`);
      
      return {
        success: true,
        totalSynced: totalPersons,
        finalCount: finalCount,
        lastSyncTime: currentDate,
        message: '人员数据增量同步完成'
      };
    } catch (error) {
      console.error('人员数据增量同步失败:', error.message);
      return {
        success: false,
        error: error.message,
        message: '人员数据增量同步失败'
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
      const statistics = await PersonModel.getStatistics();
      
      return {
        totalCount: totalCount,
        lastSyncTime: lastSyncTime,
        statistics: statistics,
        message: '同步状态获取成功'
      };
    } catch (error) {
      console.error('获取同步状态失败:', error.message);
      return {
        error: error.message,
        message: '获取同步状态失败'
      };
    }
  }

  /**
   * 根据机构ID同步人员数据
   * @param {string} organId - 机构ID
   * @returns {Promise} 同步结果
   */
  async syncByOrganId(organId) {
    console.log(`开始同步机构 ${organId} 的人员数据...`);
    
    try {
      const requestData = {
        pageSize: 1000,
        page: 1,
        ORGAN_ID: organId,
        // 其他参数保持为空
      };
      
      let totalPersons = 0;
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        console.log(`正在同步机构 ${organId} 的第 ${page} 页人员数据...`);
        
        requestData.page = page;
        const response = await http.post(this.apiUrl, requestData);
        
        if (response.data && Array.isArray(response.data)) {
          const persons = response.data;
          
          if (persons.length === 0) {
            hasMore = false;
            console.log(`机构 ${organId} 的人员数据同步完成`);
          } else {
            // 批量插入或更新人员数据
            const results = await PersonModel.bulkUpsert(persons);
            totalPersons += persons.length;
            
            console.log(`机构 ${organId} 第 ${page} 页同步完成: ${persons.length} 条记录`);
            page++;
          }
        } else {
          hasMore = false;
          console.error('接口返回数据格式异常:', response);
        }
      }
      
      const organCount = await PersonModel.getCountByOrganId(organId);
      console.log(`机构 ${organId} 的人员数据同步完成，总计 ${totalPersons} 条记录，数据库现有 ${organCount} 条记录`);
      
      return {
        success: true,
        organId: organId,
        totalSynced: totalPersons,
        organCount: organCount,
        message: `机构 ${organId} 的人员数据同步完成`
      };
    } catch (error) {
      console.error(`同步机构 ${organId} 的人员数据失败:`, error.message);
      return {
        success: false,
        organId: organId,
        error: error.message,
        message: `同步机构 ${organId} 的人员数据失败`
      };
    }
  }
}

module.exports = PersonSyncService;