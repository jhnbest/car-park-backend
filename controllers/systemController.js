const SystemService = require('../services/systemService');

class SystemController {
  static systemService = new SystemService();
  /**
   * 健康检查端点
   */
  static async healthCheck(req, res) {
    try {
      const result = await SystemController.systemService.healthCheck();
      res.json(result.data);
    } catch (error) {
      res.status(500).json({
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  /**
   * 服务状态信息
   */
  static async getStatus(req, res) {
    try {
      const result = await SystemController.systemService.getServiceStatus();
      res.json(result.data);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = SystemController;