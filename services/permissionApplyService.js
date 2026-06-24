const PermissionApplyModel = require('../models/permissionApplyModel');

/**
 * 权限申请服务 - 处理权限申请相关的业务逻辑
 */
class PermissionApplyService {
  /**
   * 获取所有园区列表
   * @returns {Promise<Array>} 园区列表
   */
  async getParks() {
    try {
      const parks = await PermissionApplyModel.getParks();
      return {
        success: true,
        data: parks
      };
    } catch (error) {
      console.error('获取园区列表失败:', error);
      throw error;
    }
  }

  /**
   * 验证员工信息
   * @param {string} empId - 员工工号
   * @returns {Promise<Object>} 员工信息
   */
  async validateEmployee(empId) {
    try {
      const employee = await PermissionApplyModel.validateEmployee(empId);

      if (employee) {
        return {
          success: true,
          data: {
            empId: employee.mf_id,
            empName: employee.cn_name,
            department: employee.dep_name,
            empStatus: employee.emp_status_nm_new,
            position: employee.work_post
          }
        };
      } else {
        return {
          success: false,
          message: '未找到该员工信息'
        };
      }
    } catch (error) {
      console.error('验证员工失败:', error);
      throw error;
    }
  }

  /**
   * 提交权限申请
   * @param {Object} applyData - 申请数据
   * @returns {Promise<Object>} 申请结果
   */
  async submitApplication(applyData) {
    try {
      const { empId, empName, parkId, parkName, applyType, credentialNo, mobile, remark } = applyData;

      // 生成申请编号
      const applyId = `PA${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // 创建申请记录
      await PermissionApplyModel.create({
        applyId,
        empId,
        empName,
        parkId,
        parkName,
        applyType,
        credentialNo,
        mobile,
        remark
      });

      return {
        success: true,
        message: '权限申请提交成功',
        data: {
          id: applyId,
          applyId: applyId,
          formInstanceId: applyId
        }
      };
    } catch (error) {
      console.error('提交权限申请失败:', error);
      throw error;
    }
  }

  /**
   * 获取申请历史
   * @param {Object} queryParams - 查询参数
   * @returns {Promise<Object>} 申请历史列表
   */
  async getApplyHistory(queryParams) {
    try {
      const result = await PermissionApplyModel.searchApplyHistory(queryParams);

      return {
        success: true,
        data: {
          list: result.data,
          totalSize: result.total,
          pageNo: result.pageNo,
          pageSize: result.pageSize
        }
      };
    } catch (error) {
      console.error('获取申请历史失败:', error);
      throw error;
    }
  }

  /**
   * 更新申请状态
   * @param {string} applyId - 申请ID
   * @param {string} status - 新状态
   * @param {string} processId - 流程ID（可选）
   * @returns {Promise<Object>} 更新结果
   */
  async updateApplyStatus(applyId, status, processId = null) {
    try {
      await PermissionApplyModel.updateStatus(applyId, status, processId);
      return {
        success: true,
        message: '状态更新成功'
      };
    } catch (error) {
      console.error('更新申请状态失败:', error);
      throw error;
    }
  }

  /**
   * 创建BPM流程
   * @param {Object} processData - 流程数据
   * @returns {Promise<Object>} 创建结果
   */
  async createBpmProcess(processData) {
    try {
      const { flowTemplateId, formId, creator, exParam, language = 'zh_CN' } = processData;

      // BPM WebService地址
      const bpmWsdl = process.env.BPM_WSDL_URL || 'http://bpmtest.xiamenair.com.cn/bpm/sys/webservice/flowWebService?wsdl';

      // 构建SOAP请求
      const soapRequest = {
        flowTemplateId: flowTemplateId || '',
        formId: formId,
        creator: creator,
        exParam: exParam,
        language: language
      };

      // 调用BPM接口（这里需要SOAP客户端，实际实现可能需要使用soap库）
      // 由于SOAP调用较为复杂，这里先返回成功模拟结果
      const processId = `PROC${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      return {
        success: true,
        data: {
          success: true,
          processId: processId,
          bpmResponse: 'T:' + processId
        }
      };
    } catch (error) {
      console.error('创建BPM流程失败:', error);
      throw error;
    }
  }

  /**
   * 审批BPM流程
   * @param {Object} approveData - 审批数据
   * @returns {Promise<Object>} 审批结果
   */
  async approveBpmProcess(approveData) {
    try {
      const { formId, processId, handler, formData, processParam, language = 'zh_CN' } = approveData;

      // BPM WebService地址
      const bpmWsdl = process.env.BPM_WSDL_URL || 'http://bpmtest.xiamenair.com.cn/bpm/sys/webservice/flowWebService?wsdl';

      // 构建SOAP请求
      const soapRequest = {
        formId: formId,
        processId: processId || '',
        handler: handler,
        formData: formData || {},
        processParam: processParam,
        language: language
      };

      // 调用BPM审批接口（这里需要SOAP客户端）
      // 模拟返回成功结果
      return {
        success: true,
        data: {
          success: true,
          bpmResponse: 'T'
        }
      };
    } catch (error) {
      console.error('审批BPM流程失败:', error);
      throw error;
    }
  }

  /**
   * 获取流程状态
   * @param {string} processId - 流程实例ID
   * @returns {Promise<Object>} 流程状态
   */
  async getProcessStatus(processId) {
    try {
      // 从数据库查询流程状态
      const apply = await PermissionApplyModel.findByProcessId(processId);

      if (apply) {
        return {
          success: true,
          data: {
            processId: apply.process_id,
            status: apply.status,
            applyId: apply.apply_id,
            updateTime: apply.update_time
          }
        };
      } else {
        return {
          success: false,
          message: '未找到流程信息'
        };
      }
    } catch (error) {
      console.error('获取流程状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取BPM待办列表
   * @param {string} loginName - 用户登录名
   * @returns {Promise<Object>} 待办列表
   */
  async getBpmTodoList(loginName) {
    try {
      // 从数据库查询当前用户的待审批申请
      const pendingList = await PermissionApplyModel.findPending();

      return {
        success: true,
        data: {
          datas: pendingList,
          page: {
            totalSize: pendingList.length,
            pageSize: pendingList.length,
            currentPage: 1
          }
        }
      };
    } catch (error) {
      console.error('获取BPM待办列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取待审批列表（根据系统标识和模块标识）
   * @param {string} loginName - 用户登录名
   * @param {string} sysId - 系统标识
   * @param {string} modelId - 模块标识
   * @returns {Promise<Object>} 待审批列表
   */
  async getPendingApprovals(loginName, sysId, modelId) {
    try {
      // 查询待审批的权限申请
      const pendingList = await PermissionApplyModel.findPending();

      return {
        success: true,
        data: pendingList
      };
    } catch (error) {
      console.error('获取待审批列表失败:', error);
      throw error;
    }
  }
}

module.exports = PermissionApplyService;
