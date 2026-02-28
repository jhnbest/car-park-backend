const cron = require('node-cron');
const OrganizationSyncService = require('./gatewayOrganizationSyncService');
const PersonSyncService = require('./gatewayPersonSyncService');
const { Logger } = require('./syncLogger');

/**
 * 数据同步定时任务调度器
 * 负责管理机构和人员数据的定时同步任务
 */
class SyncSchedulerService {
  constructor() {
    this.tasks = new Map();
    this.organizationSyncService = null;
    this.personSyncService = null;
  }

  /**
   * 初始化同步服务
   */
  initialize() {
    this.organizationSyncService = new OrganizationSyncService();
    this.personSyncService = new PersonSyncService();
    Logger.info('SyncScheduler', '同步服务初始化完成');
  }

  /**
   * 启动所有定时任务
   */
  startAllTasks() {
    this.initialize();
    console.log('========================================');
    console.log('启动数据同步定时任务...');
    console.log('========================================');

    this.addOrganizationSyncTask();
    this.addPersonSyncTask();

    console.log('========================================');
    console.log('所有定时任务已启动');
    console.log('========================================');
  }

  /**
   * 添加机构数据同步定时任务 - 每日凌晨1点执行
   */
  addOrganizationSyncTask() {
    const taskName = 'organizationSync';

    const taskFunction = async () => {
      Logger.info('SyncScheduler', '========== 定时任务开始: 机构数据同步 ==========');

      try {
        const result = await this.organizationSyncService.incrementalSync();

        Logger.info('SyncScheduler', `机构数据同步执行完成: ${result.message}`, result);

        return result;
      } catch (error) {
        Logger.error('SyncScheduler', `机构数据同步执行失败: ${error.message}`, error);
        return {
          success: false,
          message: `机构数据同步执行失败: ${error.message}`,
          error: error
        };
      }
    };

    const task = cron.schedule('0 1 * * *', taskFunction, {
      scheduled: true,
      timezone: 'Asia/Shanghai'
    });

    this.tasks.set(taskName, task);
    console.log(`定时任务 [机构数据同步] 已添加 (每日 01:00 执行)`);
  }

  /**
   * 添加人员数据同步定时任务 - 每日凌晨1点执行
   */
  addPersonSyncTask() {
    const taskName = 'personSync';

    const taskFunction = async () => {
      Logger.info('SyncScheduler', '========== 定时任务开始: 人员数据同步 ==========');

      try {
        const result = await this.personSyncService.incrementalSync();

        Logger.info('SyncScheduler', `人员数据同步执行完成: ${result.message}`, result);

        return result;
      } catch (error) {
        Logger.error('SyncScheduler', `人员数据同步执行失败: ${error.message}`, error);
        return {
          success: false,
          message: `人员数据同步执行失败: ${error.message}`,
          error: error
        };
      }
    };

    const task = cron.schedule('0 1 * * *', taskFunction, {
      scheduled: true,
      timezone: 'Asia/Shanghai'
    });

    this.tasks.set(taskName, task);
    console.log(`定时任务 [人员数据同步] 已添加 (每日 01:00 执行)`);
  }

  /**
   * 手动触发机构数据同步
   * @returns {Promise} 同步结果
   */
  async triggerOrganizationSync() {
    Logger.info('SyncScheduler', '手动触发机构数据同步');
    try {
      // 确保服务已初始化
      if (!this.organizationSyncService) {
        this.initialize();
      }
      const result = await this.organizationSyncService.incrementalSync();
      return result;
    } catch (error) {
      Logger.error('SyncScheduler', `手动触发机构数据同步失败: ${error.message}`);
      return {
        success: false,
        message: `手动触发机构数据同步失败: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * 手动触发人员数据同步
   * @returns {Promise} 同步结果
   */
  async triggerPersonSync() {
    Logger.info('SyncScheduler', '手动触发人员数据同步');
    try {
      // 确保服务已初始化
      if (!this.personSyncService) {
        this.initialize();
      }
      const result = await this.personSyncService.incrementalSync();
      return result;
    } catch (error) {
      Logger.error('SyncScheduler', `手动触发人员数据同步失败: ${error.message}`);
      return {
        success: false,
        message: `手动触发人员数据同步失败: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * 手动触发全量同步
   * @returns {Promise} 同步结果
   */
  async triggerFullSync() {
    Logger.info('SyncScheduler', '手动触发全量数据同步');
    const results = {
      organization: null,
      person: null
    };

    try {
      // 确保服务已初始化
      if (!this.organizationSyncService || !this.personSyncService) {
        this.initialize();
      }
      results.organization = await this.organizationSyncService.fullSync();
    } catch (error) {
      results.organization = {
        success: false,
        message: `机构全量同步失败: ${error.message}`,
        error: error
      };
    }

    try {
      results.person = await this.personSyncService.fullSync();
    } catch (error) {
      results.person = {
        success: false,
        message: `人员全量同步失败: ${error.message}`,
        error: error
      };
    }

    return results;
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
  }

  /**
   * 获取任务状态
   * @returns {Object} 任务状态信息
   */
  getTaskStatus() {
    const status = {};
    this.tasks.forEach((task, name) => {
      const taskCron = task;
      status[name] = {
        running: taskCron.getStatus() === 'scheduled',
        nextRun: taskCron.nextDates(1).toISOString()
      };
    });
    return status;
  }

  /**
   * 获取同步服务状态
   * @returns {Promise} 同步服务状态
   */
  async getSyncStatus() {
    const status = {
      organization: null,
      person: null
    };

    try {
      // 确保服务已初始化
      if (!this.organizationSyncService || !this.personSyncService) {
        this.initialize();
      }
      status.organization = await this.organizationSyncService.checkSyncStatus();
    } catch (error) {
      status.organization = { success: false, error: error.message };
    }

    try {
      status.person = await this.personSyncService.getSyncStatus();
    } catch (error) {
      status.person = { success: false, error: error.message };
    }

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

module.exports = SyncSchedulerService;
