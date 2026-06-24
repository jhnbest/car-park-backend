const PermissionApplyService = require('../services/permissionApplyService');

/**
 * 权限申请控制器
 * 处理权限申请相关的HTTP请求
 */
class PermissionApplyController {
  static service = new PermissionApplyService();

  /**
   * 获取园区列表
   * GET /api/parks
   */
  static async getParks(req, res) {
    try {
      const result = await PermissionApplyController.service.getParks();
      res.json(result);
    } catch (error) {
      console.error('获取园区列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取园区列表失败'
      });
    }
  }

  /**
   * 验证员工信息
   * GET /api/employee/validate/:empId
   */
  static async validateEmployee(req, res) {
    try {
      const { empId } = req.params;
      
      if (!empId) {
        return res.status(400).json({
          success: false,
          message: '员工工号不能为空'
        });
      }

      const result = await PermissionApplyController.service.validateEmployee(empId);
      res.json(result);
    } catch (error) {
      console.error('验证员工失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '验证员工失败'
      });
    }
  }

  /**
   * 提交权限申请
   * POST /api/permission/apply
   */
  static async submitApplication(req, res) {
    try {
      const applyData = req.body;
      
      // 参数验证
      if (!applyData.empId) {
        return res.status(400).json({
          success: false,
          message: '申请人工号不能为空'
        });
      }

      if (!applyData.empName) {
        return res.status(400).json({
          success: false,
          message: '申请人姓名不能为空'
        });
      }

      if (!applyData.parkId) {
        return res.status(400).json({
          success: false,
          message: '请选择申请园区'
        });
      }

      const result = await PermissionApplyController.service.submitApplication(applyData);
      res.json(result);
    } catch (error) {
      console.error('提交权限申请失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '提交权限申请失败'
      });
    }
  }

  /**
   * 获取申请历史
   * GET /api/permission/apply/history
   */
  static async getApplyHistory(req, res) {
    try {
      const queryParams = {
        empId: req.query.empId || '',
        status: req.query.status || '',
        startDate: req.query.startDate || '',
        endDate: req.query.endDate || '',
        pageNo: parseInt(req.query.pageNo) || 1,
        pageSize: parseInt(req.query.pageSize) || 10
      };

      const result = await PermissionApplyController.service.getApplyHistory(queryParams);
      res.json(result);
    } catch (error) {
      console.error('获取申请历史失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取申请历史失败'
      });
    }
  }

  /**
   * 创建BPM流程
   * POST /api/bpm/createProcess
   */
  static async createBpmProcess(req, res) {
    try {
      const processData = req.body;
      
      if (!processData.formId) {
        return res.status(400).json({
          success: false,
          message: '表单ID不能为空'
        });
      }

      if (!processData.creator) {
        return res.status(400).json({
          success: false,
          message: '创建者信息不能为空'
        });
      }

      const result = await PermissionApplyController.service.createBpmProcess(processData);
      
      // 如果BPM流程创建成功，更新申请记录的状态
      if (result.success && result.data && result.data.processId) {
        // 尝试从formId中提取applyId并更新状态
        try {
          const formIdObj = JSON.parse(processData.formId);
          if (formIdObj.formInstanceId) {
            await PermissionApplyController.service.updateApplyStatus(
              formIdObj.formInstanceId,
              'pending',
              result.data.processId
            );
          }
        } catch (e) {
          console.warn('更新申请状态失败:', e);
        }
      }

      res.json(result);
    } catch (error) {
      console.error('创建BPM流程失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '创建BPM流程失败'
      });
    }
  }

  /**
   * 审批BPM流程
   * POST /api/bpm/approveProcess
   */
  static async approveBpmProcess(req, res) {
    try {
      const approveData = req.body;
      
      if (!approveData.formId) {
        return res.status(400).json({
          success: false,
          message: '表单ID不能为空'
        });
      }

      if (!approveData.handler) {
        return res.status(400).json({
          success: false,
          message: '处理人信息不能为空'
        });
      }

      if (!approveData.processParam) {
        return res.status(400).json({
          success: false,
          message: '流程审批参数不能为空'
        });
      }

      const result = await PermissionApplyController.service.approveBpmProcess(approveData);
      res.json(result);
    } catch (error) {
      console.error('审批BPM流程失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '审批BPM流程失败'
      });
    }
  }

  /**
   * 获取流程状态
   * GET /api/bpm/processStatus/:processId
   */
  static async getProcessStatus(req, res) {
    try {
      const { processId } = req.params;
      
      if (!processId) {
        return res.status(400).json({
          success: false,
          message: '流程实例ID不能为空'
        });
      }

      const result = await PermissionApplyController.service.getProcessStatus(processId);
      res.json(result);
    } catch (error) {
      console.error('获取流程状态失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取流程状态失败'
      });
    }
  }

  /**
   * 获取BPM待办列表
   * GET /api/bpm/todoList
   */
  static async getBpmTodoList(req, res) {
    try {
      const { actionUid } = req.query;
      
      if (!actionUid) {
        return res.status(400).json({
          success: false,
          message: '用户登录名不能为空'
        });
      }

      const result = await PermissionApplyController.service.getBpmTodoList(actionUid);
      res.json(result);
    } catch (error) {
      console.error('获取BPM待办列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取BPM待办列表失败'
      });
    }
  }

  /**
   * 获取待审批列表
   * GET /api/bpm/pendingApprovals
   */
  static async getPendingApprovals(req, res) {
    try {
      const { actionUid, sysId, modelId } = req.query;
      
      const result = await PermissionApplyController.service.getPendingApprovals(
        actionUid || '',
        sysId || '',
        modelId || ''
      );
      res.json(result);
    } catch (error) {
      console.error('获取待审批列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取待审批列表失败'
      });
    }
  }
}

module.exports = PermissionApplyController;
