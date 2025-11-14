const OrganizationSyncService = require('../services/organizationSyncService');
const PersonSyncService = require('../services/personSyncService');
const SchedulerService = require('../services/schedulerService');

const organizationSyncService = new OrganizationSyncService();
const personSyncService = new PersonSyncService();
const schedulerService = new SchedulerService();

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
          data: {
            totalSynced: result.totalSynced,
            finalCount: result.finalCount
          }
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
          data: {
            totalSynced: result.totalSynced,
            finalCount: result.finalCount
          }
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
          data: {
            totalSynced: result.totalSynced,
            finalCount: result.finalCount,
            lastSyncTime: result.lastSyncTime
          }
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
          data: {
            totalSynced: result.totalSynced,
            finalCount: result.finalCount,
            lastSyncTime: result.lastSyncTime
          }
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
      
      const [orgStatus, personStatus, taskStatus] = await Promise.all([
        organizationSyncService.getSyncStatus(),
        personSyncService.getSyncStatus(),
        schedulerService.getTaskStatus()
      ]);
      
      res.json({
        success: true,
        message: '同步状态获取成功',
        data: {
          organization: orgStatus,
          person: personStatus,
          tasks: taskStatus
        }
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
          data: {
            organId: result.organId,
            totalSynced: result.totalSynced,
            organCount: result.organCount
          }
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
}

module.exports = new SyncController();