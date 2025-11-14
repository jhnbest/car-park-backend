const cron = require('node-cron');

/**
 * 定时任务服务 - 纯定时任务管理，不包含具体业务逻辑
 */
class SchedulerService {
  constructor() {
    this.tasks = new Map();
  }

  /**
   * 启动所有定时任务
   */
  startAllTasks() {
    console.log('启动所有定时任务...');
    console.log('所有定时任务已启动');
  }

  /**
   * 添加定时任务
   * @param {string} taskName - 任务名称
   * @param {string} cronExpression - cron表达式
   * @param {Function} taskFunction - 任务函数
   * @param {Object} options - 任务选项
   */
  addTask(taskName, cronExpression, taskFunction, options = {}) {
    const task = cron.schedule(cronExpression, taskFunction, {
      scheduled: true,
      timezone: 'Asia/Shanghai',
      ...options
    });
    
    this.tasks.set(taskName, task);
    console.log(`定时任务 ${taskName} 已添加 (${cronExpression})`);
  }

  /**
   * 启动指定定时任务
   * @param {string} taskName - 任务名称
   */
  startTask(taskName) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.start();
      console.log(`定时任务 ${taskName} 已启动`);
    } else {
      console.log(`定时任务 ${taskName} 不存在`);
    }
  }

  /**
   * 停止指定定时任务
   * @param {string} taskName - 任务名称
   */
  stopTask(taskName) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      console.log(`定时任务 ${taskName} 已停止`);
    } else {
      console.log(`定时任务 ${taskName} 不存在`);
    }
  }

  /**
   * 停止所有定时任务
   */
  stopAllTasks() {
    console.log('停止所有定时任务...');
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`已停止任务: ${name}`);
    });
    this.tasks.clear();
  }

  /**
   * 获取任务状态
   * @returns {Object} 任务状态信息
   */
  getTaskStatus() {
    const status = {};
    this.tasks.forEach((task, name) => {
      status[name] = {
        running: task.getStatus() === 'scheduled',
        nextRun: task.nextDates(1)[0]
      };
    });
    return status;
  }

  /**
   * 移除定时任务
   * @param {string} taskName - 任务名称
   */
  removeTask(taskName) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      this.tasks.delete(taskName);
      console.log(`定时任务 ${taskName} 已移除`);
    } else {
      console.log(`定时任务 ${taskName} 不存在`);
    }
  }

  /**
   * 获取所有任务列表
   * @returns {Array} 任务列表
   */
  getAllTasks() {
    return Array.from(this.tasks.keys());
  }
}

module.exports = SchedulerService;