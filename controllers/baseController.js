const BaseModel = require('../models/baseModel');

class BaseController {
  static async getAll(req, res) {
    try {
      const data = await BaseModel.getAll('car_park');
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // 示例健康检查端点
  static healthCheck(req, res) {
    res.json({ 
      status: 'UP', 
      timestamp: new Date().toISOString() 
    });
  }
}

module.exports = BaseController;