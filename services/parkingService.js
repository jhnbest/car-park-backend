const ParkingModel = require('../models/parkingModel');

/**
 * 停车场数据服务 - 处理停车场数据的业务逻辑
 */
class ParkingService {
  /**
   * 获取所有停车场数据
   * @returns {Promise} 停车场数据
   */
  async getAllParkingData() {
    try {
      const parkingData = await ParkingModel.findAll();
      
      return {
        success: true,
        data: parkingData,
        total: parkingData.length,
        message: '获取停车场数据成功'
      };
    } catch (error) {
      console.error('获取停车场数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 根据ID获取停车场详情
   * @param {number} parkingId - 停车场ID
   * @returns {Promise} 停车场详情
   */
  async getParkingById(parkingId) {
    try {
      const parking = await ParkingModel.findById(parkingId);
      if (!parking) {
        throw new Error('停车场不存在');
      }

      return {
        success: true,
        data: parking,
        message: '获取停车场详情成功'
      };
    } catch (error) {
      console.error('获取停车场详情失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取停车场统计数据
   * @returns {Promise} 统计信息
   */
  async getParkingStatistics() {
    try {
      const totalParkings = await ParkingModel.getCount();
      const statistics = await ParkingModel.getStatistics();

      return {
        success: true,
        data: {
          totalParkings,
          statistics
        },
        message: '获取停车场统计数据成功'
      };
    } catch (error) {
      console.error('获取停车场统计数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 搜索停车场数据
   * @param {string} keyword - 搜索关键词
   * @param {number} page - 页码
   * @param {number} pageSize - 每页大小
   * @returns {Promise} 搜索结果
   */
  async searchParkingData(keyword, page = 1, pageSize = 20) {
    try {
      const result = await ParkingModel.search(keyword, page, pageSize);

      return {
        success: true,
        data: result.data,
        pagination: {
          page,
          pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / pageSize)
        },
        message: '搜索停车场数据成功'
      };
    } catch (error) {
      console.error('搜索停车场数据失败:', error.message);
      throw error;
    }
  }
}

module.exports = ParkingService;