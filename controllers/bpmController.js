const BpmSoapService = require('../services/bpmSoapService');
const BpmClientService = require('../services/bpmClientService');
const PermissionApplyService = require('../services/permissionApplyService');

/**
 * BPM控制器
 * 1. 业务系统接口 - BPM会调用这些接口
 * 2. BPM客户端接口 - 业务系统调用BPM的接口
 */
class BpmController {
  static bpmClient = new BpmClientService();
  static permissionService = new PermissionApplyService();

  // ==================== 业务系统接口（BPM调用） ====================

  /**
   * 获取业务表单模板列表
   * BPM配置流程模板时会调用此接口
   * GET /api/bpm/soap/getTemplateFormList
   */
  static async getTemplateFormList(req, res) {
    try {
      const { sysId, language } = req.query;
      console.log(`[BPM回调] getTemplateFormList - sysId: ${sysId}, language: ${language}`);
      
      const result = await BpmSoapService.getTemplateFormList(sysId, language);
      
      // BPM要求直接返回字符串
      res.set('Content-Type', 'text/plain; charset=utf-8');
      res.send(result);
    } catch (error) {
      console.error('[BPM回调] getTemplateFormList失败:', error);
      res.status(500).send('F：服务异常');
    }
  }

  /**
   * 获取业务表单字段列表
   * BPM配置流程模板关联业务表单字段时会调用此接口
   * GET /api/bpm/soap/getFormFieldList
   */
  static async getFormFieldList(req, res) {
    try {
      const { sysId, modelId, templateFormId, language } = req.query;
      console.log(`[BPM回调] getFormFieldList - sysId: ${sysId}, modelId: ${modelId}`);
      
      const result = await BpmSoapService.getFormFieldList(sysId, modelId, templateFormId, language);
      
      res.set('Content-Type', 'text/plain; charset=utf-8');
      res.send(result);
    } catch (error) {
      console.error('[BPM回调] getFormFieldList失败:', error);
      res.status(500).send('F：服务异常');
    }
  }

  /**
   * 获取业务表单字段值
   * 流程流转中BPM获取表单字段值时会调用此接口
   * GET /api/bpm/soap/getFormFieldValueList
   */
  static async getFormFieldValueList(req, res) {
    try {
      const { sysId, modelId, templateFormId, formInstanceId, fieldIds, language } = req.query;
      console.log(`[BPM回调] getFormFieldValueList - formInstanceId: ${formInstanceId}`);
      
      const result = await BpmSoapService.getFormFieldValueList(
        sysId, modelId, templateFormId, formInstanceId, fieldIds, language
      );
      
      res.set('Content-Type', 'text/plain; charset=utf-8');
      res.send(result);
    } catch (error) {
      console.error('[BPM回调] getFormFieldValueList失败:', error);
      res.status(500).send('F：服务异常');
    }
  }

  /**
   * 获取业务逻辑方法列表
   * BPM配置流程事件监听器时会调用此接口
   * GET /api/bpm/soap/getMethodInfo
   */
  static async getMethodInfo(req, res) {
    try {
      const { sysId, modelId, templateFormId, language } = req.query;
      console.log(`[BPM回调] getMethodInfo - sysId: ${sysId}, modelId: ${modelId}`);
      
      const result = await BpmSoapService.getMethodInfo(sysId, modelId, templateFormId, language);
      
      res.set('Content-Type', 'text/plain; charset=utf-8');
      res.send(result);
    } catch (error) {
      console.error('[BPM回调] getMethodInfo失败:', error);
      res.status(500).send('F：服务异常');
    }
  }

  /**
   * 执行业务逻辑方法
   * 流程事件触发时BPM会调用此接口
   * POST /api/bpm/soap/doMethodProcess
   */
  static async doMethodProcess(req, res) {
    try {
      const { formId, functionId, processData, language } = req.body;
      console.log(`[BPM回调] doMethodProcess - functionId: ${functionId}`);
      
      const result = await BpmSoapService.doMethodProcess({
        formId,
        functionId,
        processData,
        language
      });
      
      res.set('Content-Type', 'text/plain; charset=utf-8');
      res.send(result);
    } catch (error) {
      console.error('[BPM回调] doMethodProcess失败:', error);
      res.status(500).send(`F：${error.message}`);
    }
  }

  /**
   * 动态获取流程审批人
   * BPM公式定义器设置节点处理人会调用此接口
   * GET /api/bpm/soap/getBusinessOrg
   */
  static async getBusinessOrg(req, res) {
    try {
      const { sysId, modelId, templateFormId, formInstanceId, nodeId, nodeName, language } = req.query;
      console.log(`[BPM回调] getBusinessOrg - nodeId: ${nodeId}, nodeName: ${nodeName}`);
      
      const result = await BpmSoapService.getBusinessOrg(
        sysId, modelId, templateFormId, formInstanceId, nodeId, nodeName, language
      );
      
      res.set('Content-Type', 'text/plain; charset=utf-8');
      res.send(result);
    } catch (error) {
      console.error('[BPM回调] getBusinessOrg失败:', error);
      res.status(500).send('F：服务异常');
    }
  }

  /**
   * 同步流程模板信息
   * BPM流程模板同步时会调用此接口
   * POST /api/bpm/soap/synchronizeTemplate
   */
  static async synchronizeTemplate(req, res) {
    try {
      const { sysId, flowDefinitionId, flowTemplateId, operationType, language } = req.body;
      console.log(`[BPM回调] synchronizeTemplate - flowTemplateId: ${flowTemplateId}, operationType: ${operationType}`);
      
      const result = await BpmSoapService.synchronizeTemplate(
        sysId, flowDefinitionId, flowTemplateId, operationType, language
      );
      
      res.set('Content-Type', 'text/plain; charset=utf-8');
      res.send(result);
    } catch (error) {
      console.error('[BPM回调] synchronizeTemplate失败:', error);
      res.status(500).send(`F：${error.message}`);
    }
  }

  // ==================== BPM客户端接口（业务系统调用BPM） ====================

  /**
   * 创建BPM流程
   * POST /api/bpm/client/createProcess
   */
  static async createProcess(req, res) {
    try {
      const { flowTemplateId, formInstanceId, creatorLoginName, docSubject, exParam } = req.body;

      if (!creatorLoginName) {
        return res.status(400).json({
          success: false,
          message: '创建者登录名不能为空'
        });
      }

      const result = await BpmController.bpmClient.createProcess({
        flowTemplateId: flowTemplateId || '',
        formInstanceId: formInstanceId || '',
        creatorLoginName,
        docSubject,
        exParam
      });

      // 如果创建成功，且有formInstanceId，更新申请记录的状态
      if (result.success && result.data && formInstanceId) {
        try {
          await BpmController.permissionService.updateApplyStatus(
            formInstanceId,
            'pending',
            result.data.processId
          );
        } catch (e) {
          console.warn('更新申请状态失败:', e);
        }
      }

      res.json(result);
    } catch (error) {
      console.error('[BPM客户端] createProcess失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '创建BPM流程失败'
      });
    }
  }

  /**
   * 审批BPM流程
   * POST /api/bpm/client/approveProcess
   */
  static async approveProcess(req, res) {
    try {
      const { formInstanceId, processId, handlerLoginName, formData, processParam } = req.body;
      
      if (!handlerLoginName) {
        return res.status(400).json({
          success: false,
          message: '处理人登录名不能为空'
        });
      }

      if (!processParam) {
        return res.status(400).json({
          success: false,
          message: '流程审批参数不能为空'
        });
      }

      const result = await BpmController.bpmClient.approveProcess({
        formInstanceId,
        processId,
        handlerLoginName,
        formData,
        processParam
      });

      res.json(result);
    } catch (error) {
      console.error('[BPM客户端] approveProcess失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '审批BPM流程失败'
      });
    }
  }

  /**
   * 获取BPM审批页面URL
   * GET /api/bpm/client/approvalPageUrl
   */
  static async getApprovalPageUrl(req, res) {
    try {
      const { processId, type } = req.query;
      
      if (!processId) {
        return res.status(400).json({
          success: false,
          message: '流程实例ID不能为空'
        });
      }

      const url = BpmController.bpmClient.getApprovalPageUrl(processId, type || 'view');

      res.json({
        success: true,
        data: { url }
      });
    } catch (error) {
      console.error('[BPM客户端] getApprovalPageUrl失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取审批页面URL失败'
      });
    }
  }

  /**
   * 获取待审批列表
   * GET /api/bpm/client/unApprovingLists
   */
  static async getUnApprovingLists(req, res) {
    try {
      const { actionUid, docSubject, docStatus } = req.query;
      
      if (!actionUid) {
        return res.status(400).json({
          success: false,
          message: '用户登录名不能为空'
        });
      }

      const conditions = {};
      if (docSubject) conditions.docSubject = docSubject;
      if (docStatus) conditions.docStatus = docStatus;

      const result = await BpmController.bpmClient.getUnApprovingLists(actionUid, conditions);

      res.json(result);
    } catch (error) {
      console.error('[BPM客户端] getUnApprovingLists失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取待审批列表失败'
      });
    }
  }

  /**
   * 获取已审批列表
   * GET /api/bpm/client/approvedLists
   */
  static async getApprovedLists(req, res) {
    try {
      const { actionUid, docSubject, docStatus } = req.query;
      
      if (!actionUid) {
        return res.status(400).json({
          success: false,
          message: '用户登录名不能为空'
        });
      }

      const conditions = {};
      if (docSubject) conditions.docSubject = docSubject;
      if (docStatus) conditions.docStatus = docStatus;

      const result = await BpmController.bpmClient.getApprovedLists(actionUid, conditions);

      res.json(result);
    } catch (error) {
      console.error('[BPM客户端] getApprovedLists失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取已审批列表失败'
      });
    }
  }

  /**
   * 检查审批权限
   * GET /api/bpm/client/canApproval
   */
  static async canApproval(req, res) {
    try {
      const { formInstanceId, actionUid } = req.query;
      
      if (!formInstanceId) {
        return res.status(400).json({
          success: false,
          message: '表单实例ID不能为空'
        });
      }

      if (!actionUid) {
        return res.status(400).json({
          success: false,
          message: '用户登录名不能为空'
        });
      }

      const result = await BpmController.bpmClient.canApprovalProcess(formInstanceId, actionUid);

      res.json(result);
    } catch (error) {
      console.error('[BPM客户端] canApproval失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '检查审批权限失败'
      });
    }
  }

  /**
   * 检查流程是否存在
   * GET /api/bpm/client/isExistProcess
   */
  static async isExistProcess(req, res) {
    try {
      const { formInstanceId } = req.query;
      
      if (!formInstanceId) {
        return res.status(400).json({
          success: false,
          message: '表单实例ID不能为空'
        });
      }

      const result = await BpmController.bpmClient.isExistProcess(formInstanceId);

      res.json(result);
    } catch (error) {
      console.error('[BPM客户端] isExistProcess失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '检查流程是否存在失败'
      });
    }
  }

  /**
   * BPM待办跳转路由
   * BPM门户待办跳转时会调用此接口
   * GET /api/bpm/redirect
   */
  static async redirect(req, res) {
    try {
      const { sysId, modelId, templateFormId, formInstanceId, processInstanceId, flowTemplateId, workitemId, notifyFlag } = req.query;
      
      console.log(`[BPM跳转] redirect - formInstanceId: ${formInstanceId}, processInstanceId: ${processInstanceId}`);
      
      // 根据参数重定向到相应的页面
      // 这里可以根据实际情况重定向到详情页或审批页
      const redirectUrl = `/permission-apply/detail?formInstanceId=${formInstanceId}&processInstanceId=${processInstanceId}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('[BPM跳转] redirect失败:', error);
      res.status(500).send('跳转失败');
    }
  }
}

module.exports = BpmController;
