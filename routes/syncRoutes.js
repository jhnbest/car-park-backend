const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const SyncLogModel = require('../models/syncLogModel');

/**
 * 同步相关路由
 */

// 机构数据同步路由
router.post('/organization/full', syncController.organizationFullSync);
router.post('/organization/incremental', syncController.organizationIncrementalSync);

// 人员数据同步路由
router.post('/person/full', syncController.personFullSync);
router.post('/person/incremental', syncController.personIncrementalSync);
router.post('/person/organ/:organId', syncController.syncPersonByOrganId);

// 定时任务管理路由
router.post('/scheduler/start', syncController.startScheduler);
router.post('/scheduler/stop', syncController.stopScheduler);

// 状态查询路由
router.get('/status', syncController.getSyncStatus);

// 同步日志查询路由
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, taskName } = req.query;
    const result = await SyncLogModel.getLogs(
      parseInt(page),
      parseInt(pageSize),
      taskName || null
    );
    
    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: result.total,
        totalPages: Math.ceil(result.total / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('获取同步日志失败:', error);
    res.status(500).json({
      success: false,
      message: '获取同步日志失败: ' + error.message
    });
  }
});

// 服务治理中心同步路由
router.get('/gateway/tasks', syncController.getAllTasks);
router.get('/gateway/status', syncController.getGatewaySyncStatus);
router.post('/gateway/organization/sync', syncController.triggerGatewayOrganizationSync);
router.post('/gateway/person/sync', syncController.triggerGatewayPersonSync);
router.post('/gateway/task/start', syncController.startTask);
router.post('/gateway/task/stop', syncController.stopTask);

module.exports = router;