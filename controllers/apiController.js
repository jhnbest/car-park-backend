const ParkingService = require('../services/parkingService');

class ApiController {
  static parkingService = new ParkingService();
  /**
   * 获取停车场数据
   * 保留此功能，因为停车场数据是核心业务功能
   */
  static async getAllParkingData(req, res) {
    try {
      const data = await ApiController.parkingService.getAllParkingData();
      res.json({ 
        success: true, 
        data,
        count: data.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = ApiController;