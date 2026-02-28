const OrganizationSyncService = require('../services/gatewayOrganizationSyncService');
const PersonSyncService = require('../services/gatewayPersonSyncService');
const SchedulerService = require('../services/schedulerService');
const SyncSchedulerService = require('../services/syncSchedulerService');

const organizationSyncService = new OrganizationSyncService();
const personSyncService = new PersonSyncService();
const schedulerService = new SchedulerService();
const syncSchedulerService = new SyncSchedulerService();

/**
 * 同步功能控制器 - 处理数据同步相关的API请求
 */
class SyncController {
  /**
   * 机构数据全量同步
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async organizationFullSync(req, res) {
    try {
      console.log('接收到机构数据全量同步请求');
      const result = await organizationSyncService.fullSync();

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.details || {}
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error
        });
      }
    } catch (error) {
      console.error('机构数据全量同步控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '机构数据全量同步失败',
        error: error.message
      });
    }
  }

  /**
   * 人员数据全量同步
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async personFullSync(req, res) {
    try {
      console.log('接收到人员数据全量同步请求');
      const result = await personSyncService.fullSync();

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.details || {}
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error
        });
      }
    } catch (error) {
      console.error('人员数据全量同步控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '人员数据全量同步失败',
        error: error.message
      });
    }
  }

  /**
   * 机构数据增量同步
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async organizationIncrementalSync(req, res) {
    try {
      console.log('接收到机构数据增量同步请求');
      const result = await organizationSyncService.incrementalSync();

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.details || {}
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error
        });
      }
    } catch (error) {
      console.error('机构数据增量同步控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '机构数据增量同步失败',
        error: error.message
      });
    }
  }

  /**
   * 人员数据增量同步
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async personIncrementalSync(req, res) {
    try {
      console.log('接收到人员数据增量同步请求');
      const result = await personSyncService.incrementalSync();

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.details || {}
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error
        });
      }
    } catch (error) {
      console.error('人员数据增量同步控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '人员数据增量同步失败',
        error: error.message
      });
    }
  }

  /**
   * 获取同步状态
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getSyncStatus(req, res) {
    try {
      console.log('接收到获取同步状态请求');

      const status = await syncSchedulerService.getSyncStatus();

      res.json({
        success: true,
        message: '同步状态获取成功',
        data: status
      });
    } catch (error) {
      console.error('获取同步状态控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '获取同步状态失败',
        error: error.message
      });
    }
  }

  /**
   * 启动定时任务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  startScheduler(req, res) {
    try {
      console.log('接收到启动定时任务请求');
      schedulerService.startAllTasks();

      res.json({
        success: true,
        message: '定时任务已启动'
      });
    } catch (error) {
      console.error('启动定时任务控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '启动定时任务失败',
        error: error.message
      });
    }
  }

  /**
   * 停止定时任务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  stopScheduler(req, res) {
    try {
      console.log('接收到停止定时任务请求');
      schedulerService.stopAllTasks();

      res.json({
        success: true,
        message: '定时任务已停止'
      });
    } catch (error) {
      console.error('停止定时任务控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '停止定时任务失败',
        error: error.message
      });
    }
  }

  /**
   * 根据机构ID同步人员数据
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async syncPersonByOrganId(req, res) {
    try {
      const { organId } = req.params;
      console.log(`接收到同步机构 ${organId} 人员数据请求`);

      if (!organId) {
        return res.status(400).json({
          success: false,
          message: '机构ID不能为空'
        });
      }

      const result = await personSyncService.syncByOrganId(organId);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.details || {}
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error
        });
      }
    } catch (error) {
      console.error('按机构同步人员数据控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '按机构同步人员数据失败',
        error: error.message
      });
    }
  }

  /**
   * 获取所有定时任务列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getAllTasks(req, res) {
    try {
      console.log('接收到获取所有定时任务列表请求');

      const tasks = syncSchedulerService.getAllTasks();
      const status = await syncSchedulerService.getSyncStatus();
      const taskStatus = syncSchedulerService.getTaskStatus();

      res.json({
        success: true,
        message: '获取定时任务列表成功',
        data: {
          tasks: tasks,
          taskStatus: taskStatus,
          syncStatus: status
        }
      });
    } catch (error) {
      console.error('获取定时任务列表控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '获取定时任务列表失败',
        error: error.message
      });
    }
  }

  /**
   * 手动触发服务治理中心机构同步
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async triggerGatewayOrganizationSync(req, res) {
    try {
      console.log('接收到手动触发服务治理中心机构同步请求');
      const result = await syncSchedulerService.triggerOrganizationSync();

      res.json({
        success: result.success,
        message: result.message,
        data: result.details || {}
      });
    } catch (error) {
      console.error('手动触发机构同步控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '手动触发机构同步失败',
        error: error.message
      });
    }
  }

  /**
   * 手动触发服务治理中心人员同步
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async triggerGatewayPersonSync(req, res) {
    try {
      console.log('接收到手动触发服务治理中心人员同步请求');
      const result = await syncSchedulerService.triggerPersonSync();

      res.json({
        success: result.success,
        message: result.message,
        data: result.details || {}
      });
    } catch (error) {
      console.error('手动触发人员同步控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '手动触发人员同步失败',
        error: error.message
      });
    }
  }

  /**
   * 启动指定定时任务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  startTask(req, res) {
    try {
      const { taskName } = req.body;
      console.log(`接收到启动定时任务请求: ${taskName}`);

      if (!taskName) {
        return res.status(400).json({
          success: false,
          message: '任务名称不能为空'
        });
      }

      syncSchedulerService.startTask(taskName);

      res.json({
        success: true,
        message: `定时任务 ${taskName} 已启动`
      });
    } catch (error) {
      console.error('启动定时任务控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '启动定时任务失败',
        error: error.message
      });
    }
  }

  /**
   * 停止指定定时任务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  stopTask(req, res) {
    try {
      const { taskName } = req.body;
      console.log(`接收到停止定时任务请求: ${taskName}`);

      if (!taskName) {
        return res.status(400).json({
          success: false,
          message: '任务名称不能为空'
        });
      }

      syncSchedulerService.stopTask(taskName);

      res.json({
        success: true,
        message: `定时任务 ${taskName} 已停止`
      });
    } catch (error) {
      console.error('停止定时任务控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '停止定时任务失败',
        error: error.message
      });
    }
  }

  /**
   * 获取同步服务状态
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getGatewaySyncStatus(req, res) {
    try {
      console.log('接收到获取服务治理中心同步状态请求');

      const status = await syncSchedulerService.getSyncStatus();

      res.json({
        success: true,
        message: '获取同步状态成功',
        data: status
      });
    } catch (error) {
      console.error('获取同步状态控制器错误:', error);
      res.status(500).json({
        success: false,
        message: '获取同步状态失败',
        error: error.message
      });
    }
  }
}

module.exports = new SyncController();
