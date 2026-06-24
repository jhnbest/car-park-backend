const express = require('express');
const router = express.Router();
const BpmController = require('../controllers/bpmController');

/**
 * BPM路由
 * 1. 业务系统回调接口 - BPM会调用这些接口（SOAP接口）
 * 2. BPM客户端接口 - 业务系统调用BPM的接口
 */

// ==================== 业务系统回调接口（BPM调用） ====================

// BPM回调 - 获取业务表单模板列表
router.get('/soap/getTemplateFormList', BpmController.getTemplateFormList);

// BPM回调 - 获取业务表单字段列表
router.get('/soap/getFormFieldList', BpmController.getFormFieldList);

// BPM回调 - 获取业务表单字段值
router.get('/soap/getFormFieldValueList', BpmController.getFormFieldValueList);

// BPM回调 - 获取业务逻辑方法列表
router.get('/soap/getMethodInfo', BpmController.getMethodInfo);

// BPM回调 - 执行业务逻辑方法
router.post('/soap/doMethodProcess', BpmController.doMethodProcess);

// BPM回调 - 动态获取流程审批人
router.get('/soap/getBusinessOrg', BpmController.getBusinessOrg);

// BPM回调 - 同步流程模板信息
router.post('/soap/synchronizeTemplate', BpmController.synchronizeTemplate);

// BPM门户待办跳转路由
router.get('/redirect', BpmController.redirect);

// ==================== BPM客户端接口（业务系统调用BPM） ====================

// 创建BPM流程
router.post('/client/createProcess', BpmController.createProcess);

// 审批BPM流程
router.post('/client/approveProcess', BpmController.approveProcess);

// 获取BPM审批页面URL
router.get('/client/approvalPageUrl', BpmController.getApprovalPageUrl);

// 获取待审批列表
router.get('/client/unApprovingLists', BpmController.getUnApprovingLists);

// 获取已审批列表
router.get('/client/approvedLists', BpmController.getApprovedLists);

// 检查审批权限
router.get('/client/canApproval', BpmController.canApproval);

// 检查流程是否存在
router.get('/client/isExistProcess', BpmController.isExistProcess);

module.exports = router;
