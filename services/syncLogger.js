/**
 * 日志服务 - 统一日志记录
 */
class Logger {
  /**
   * 记录日志
   * @param {string} level - 日志级别
   * @param {string} module - 模块名称
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  static log(level, module, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;

    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  /**
   * 信息日志
   */
  static info(module, message, data = null) {
    this.log('info', module, message, data);
  }

  /**
   * 警告日志
   */
  static warn(module, message, data = null) {
    this.log('warn', module, message, data);
  }

  /**
   * 错误日志
   */
  static error(module, message, data = null) {
    this.log('error', module, message, data);
  }

  /**
   * 调试日志
   */
  static debug(module, message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', module, message, data);
    }
  }
}

/**
 * 同步任务结果通知服务
 */
class SyncNotificationService {
  /**
   * 发送同步任务结果通知
   * @param {Object} result - 同步结果
   */
  static async sendNotification(result) {
    const { taskName, success, message, details, error } = result;

    const notification = {
      taskName,
      success,
      message,
      timestamp: new Date().toISOString(),
      details,
      error: error ? error.message : null
    };

    Logger.info('SyncNotification', `同步任务 ${taskName} 执行完成`, notification);

    return notification;
  }
}

module.exports = {
  Logger,
  SyncNotificationService
};
