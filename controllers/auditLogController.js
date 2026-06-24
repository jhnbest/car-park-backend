const AuditLogService = require('../services/auditLogService');

class AuditLogController {
  static async getLogs(req, res) {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const filters = {
        startTime: req.query.startTime,
        endTime: req.query.endTime,
        userId: req.query.userId,
        userName: req.query.userName,
        operationType: req.query.operationType,
        ipAddress: req.query.ipAddress,
        operationResult: req.query.operationResult,
        businessId: req.query.businessId
      };

      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const result = await AuditLogService.query(filters, {
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10)
      });

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize
      });
    } catch (error) {
      console.error('[AuditLogController] Failed to get logs:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取日志列表失败'
      });
    }
  }

  static async getLogById(req, res) {
    try {
      const { id } = req.params;
      const log = await AuditLogService.getById(id);

      if (!log) {
        return res.status(404).json({
          success: false,
          message: '日志记录不存在'
        });
      }

      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      console.error('[AuditLogController] Failed to get log by id:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取日志详情失败'
      });
    }
  }

  static async exportLogs(req, res) {
    try {
      const filters = {
        startTime: req.query.startTime,
        endTime: req.query.endTime,
        userId: req.query.userId,
        userName: req.query.userName,
        operationType: req.query.operationType,
        ipAddress: req.query.ipAddress,
        operationResult: req.query.operationResult
      };

      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const logs = await AuditLogService.export(filters);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${Date.now()}.xlsx`);

      const excelData = formatLogsToExcel(logs);

      res.json({
        success: true,
        data: excelData,
        total: logs.length
      });
    } catch (error) {
      console.error('[AuditLogController] Failed to export logs:', error);
      res.status(500).json({
        success: false,
        message: error.message || '导出日志失败'
      });
    }
  }

  static async cleanupLogs(req, res) {
    try {
      const { daysToKeep = 90 } = req.body;
      const result = await AuditLogService.cleanup(parseInt(daysToKeep, 10));

      res.json({
        success: true,
        message: `成功清理 ${result.deleted} 条过期日志`,
        deleted: result.deleted
      });
    } catch (error) {
      console.error('[AuditLogController] Failed to cleanup logs:', error);
      res.status(500).json({
        success: false,
        message: error.message || '清理日志失败'
      });
    }
  }

  static async getStats(req, res) {
    try {
      const { startTime, endTime } = req.query;

      const defaultStartTime = new Date();
      defaultStartTime.setDate(defaultStartTime.getDate() - 30);
      const defaultEndTime = new Date();

      const stats = await AuditLogService.getStats(
        startTime || defaultStartTime.toISOString(),
        endTime || defaultEndTime.toISOString()
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('[AuditLogController] Failed to get stats:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取统计数据失败'
      });
    }
  }
}

function formatLogsToExcel(logs) {
  return logs.map(log => ({
    'ID': log.id,
    '操作类型': log.operation_type,
    '操作时间': log.operation_time,
    '用户ID': log.user_id,
    '用户名': log.user_name,
    'IP地址': log.ip_address,
    '设备信息': log.device_info,
    '操作详情': typeof log.operation_details === 'object' ? JSON.stringify(log.operation_details) : log.operation_details,
    '变更前状态': typeof log.before_state === 'object' ? JSON.stringify(log.before_state) : log.before_state,
    '变更后状态': typeof log.after_state === 'object' ? JSON.stringify(log.after_state) : log.after_state,
    '操作结果': log.operation_result,
    '错误信息': log.error_message,
    '业务ID': log.business_id,
    '业务类型': log.business_type,
    '耗时(ms)': log.duration
  }));
}

module.exports = AuditLogController;
