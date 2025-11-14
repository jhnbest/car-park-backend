const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

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

module.exports = router;