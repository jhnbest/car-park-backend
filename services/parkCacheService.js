const BaseModel = require('../models/baseModel');
const SyncLogModel = require('../models/syncLogModel');
const jieLinkApiService = require('./jieLinkApiService');
const parkApiConfig = require('../config/park-api-config');

class ParkCacheService {
  constructor() {
    this.tableName = 'park_cache';
  }

  async getCacheByParkId(parkId) {
    const sql = `SELECT * FROM "${this.tableName}" WHERE "park_id" = ? ORDER BY "cached_at" DESC LIMIT 1`;
    const result = await this.query(sql, [parkId]);
    return result.length > 0 ? result[0] : null;
  }

  async getAllCaches() {
    const sql = `SELECT t1.* FROM "${this.tableName}" t1 
      INNER JOIN (
        SELECT "park_id", MAX("cached_at") as max_time 
        FROM "${this.tableName}" 
        GROUP BY "park_id"
      ) t2 ON t1."park_id" = t2."park_id" AND t1."cached_at" = t2.max_time`;
    return this.query(sql);
  }

  async insertCache(parkId, data) {
    const sql = `
      INSERT INTO "${this.tableName}" 
      ("park_id", "gate_count", "vehicle_count", "daily_pass_count", "person_count", "cached_at")
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    await this.query(sql, [
      parkId,
      data.gateCount || 0,
      data.vehicleCount || 0,
      data.dailyPassCount || 0,
      data.personCount || 0
    ]);
  }

  async query(sql, params = []) {
    const connection = await require('../config/db').createConnection();
    try {
      const result = await require('../config/db').executeQuery(connection, sql, params);
      return result;
    } finally {
      try {
        await connection.close();
      } catch (closeError) {
        console.warn('连接关闭失败:', closeError.message);
      }
    }
  }

  async syncParkData(parkId) {
    const config = parkApiConfig.getParkConfig(parkId);
    if (!config) {
      return { success: false, message: `园区 ${parkId} 配置不存在` };
    }

    const result = {
      gateCount: 0,
      vehicleCount: 0,
      dailyPassCount: 0,
      personCount: 0,
      errors: []
    };

    try {
      const deviceResult = await jieLinkApiService.getDeviceAccessPoints(parkId);
      if (deviceResult?.data?.deviceAccessPoints) {
        const deviceAccessPoints = deviceResult.data.deviceAccessPoints;
        result.gateCount = deviceAccessPoints.reduce((total, ap) => {
          return total + (Array.isArray(ap.devices) ? ap.devices.length : 0);
        }, 0);
      }
    } catch (error) {
      console.warn(`同步道闸数据失败: ${error.message}`);
      result.errors.push('道闸数据');
    }

    try {
      const firstResult = await jieLinkApiService.getPersonList(parkId, 1, 100);
      const totalPersonCount = firstResult?.data?.totalCount || 0;
      result.personCount = totalPersonCount;

      let totalVehicleCount = 0;
      const firstPersonList = firstResult?.data?.personList || [];
      for (const person of firstPersonList) {
        const vehicleList = person.vehicleList || [];
        totalVehicleCount += vehicleList.length;
      }

      const pageCount = Math.ceil(totalPersonCount / 100);
      for (let pageIndex = 2; pageIndex <= pageCount; pageIndex++) {
        try {
          const pageResult = await jieLinkApiService.getPersonList(parkId, pageIndex, 100);
          const pagePersonList = pageResult?.data?.personList || [];
          for (const person of pagePersonList) {
            const vehicleList = person.vehicleList || [];
            totalVehicleCount += vehicleList.length;
          }
        } catch (e) {
          console.warn(`同步第${pageIndex}页失败:`, e.message);
          break;
        }
      }

      result.vehicleCount = totalVehicleCount;
    } catch (error) {
      console.warn(`同步人员数据失败: ${error.message}`);
      result.personCount = 0;
      result.vehicleCount = 0;
      result.errors.push('人员数据');
    }

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      const formatTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const parkingResult = await jieLinkApiService.getInParkingRecords(
        parkId,
        formatTime(today),
        formatTime(tomorrow)
      );
      result.dailyPassCount = parkingResult?.data?.totalCount || 0;
    } catch (error) {
      console.warn(`同步场内记录失败: ${error.message}`);
      result.errors.push('场内记录');
    }

    await this.insertCache(parkId, result);

    const hasErrors = result.errors && result.errors.length > 0;
    return {
      success: !hasErrors,
      message: hasErrors ? `同步部分失败: ${result.errors.join(', ')}` : '同步成功',
      data: result
    };
  }

  async syncAllParks() {
    const startTime = Date.now()
    const configs = parkApiConfig.getAllParks();
    const parkIds = Object.keys(configs);
    
    const results = [];
    for (const parkId of parkIds) {
      const result = await this.syncParkData(parkId);
      results.push({ parkId, ...result });
    }

    const successCount = results.filter(r => r.success).length
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    
    const totalPersons = results.reduce((sum, r) => sum + (r.data?.personCount || 0), 0)
    const totalVehicles = results.reduce((sum, r) => sum + (r.data?.vehicleCount || 0), 0)
    
    try {
      await SyncLogModel.create({
        task_name: 'parkCacheSync',
        sync_type: 'incremental',
        status: successCount === parkIds.length ? 'success' : 'failed',
        message: `授权车辆缓存同步完成: ${totalPersons}人, ${totalVehicles}辆车`,
        total_fetched: totalPersons,
        total_processed: totalVehicles,
        duration: duration
      })
    } catch (logError) {
      console.warn('记录同步日志失败:', logError.message)
    }

    return {
      success: true,
      message: `同步完成: ${successCount}/${parkIds.length} 个园区`,
      results
    };
  }
}

module.exports = new ParkCacheService();
