const express = require('express');
const router = express.Router();
const PermissionApplyController = require('../controllers/permissionApplyController');

/**
 * 权限申请路由
 * 处理权限申请相关的API请求
 */

// 园区相关路由
router.get('/parks', PermissionApplyController.getParks);

// 员工验证路由
router.get('/employee/validate/:empId', PermissionApplyController.validateEmployee);

// 权限申请相关路由
router.post('/permission/apply', PermissionApplyController.submitApplication);
router.get('/permission/apply/history', PermissionApplyController.getApplyHistory);

// BPM流程相关路由
router.post('/bpm/createProcess', PermissionApplyController.createBpmProcess);
router.post('/bpm/approveProcess', PermissionApplyController.approveBpmProcess);
router.get('/bpm/processStatus/:processId', PermissionApplyController.getProcessStatus);
router.get('/bpm/todoList', PermissionApplyController.getBpmTodoList);
router.get('/bpm/pendingApprovals', PermissionApplyController.getPendingApprovals);

module.exports = router;
