const soap = require('strong-soap');

/**
 * BPM流程引擎SOAP客户端服务
 * 负责通过SOAP协议调用BPM的WebService接口
 * WSDL地址：http://bpmtest.xiamenair.com.cn/bpm/sys/webservice/flowWebService?wsdl
 */
class BpmClientService {
  constructor() {
    this.bpmWsdl = process.env.BPM_WSDL_URL || 'http://bpmtest.xiamenair.com.cn/bpm/sys/webservice/flowWebService?wsdl';
    this.sysId = 'cldz';
    this.modelId = 'permission-apply';
    this.templateFormId = 'park-permission-form';
    this.soapClient = null;
    this.clientReady = false;
  }

  /**
   * 初始化SOAP客户端（懒加载，首次调用时创建）
   * @returns {Promise<Object>} SOAP客户端实例
   */
  async getClient() {
    if (this.clientReady && this.soapClient) {
      return this.soapClient;
    }

    return new Promise((resolve, reject) => {
      soap.createClient(this.bpmWsdl, (err, client) => {
        if (err) {
          console.error('[BPM客户端] SOAP客户端初始化失败:', err.message);
          this.clientReady = false;
          reject(new Error(`SOAP客户端初始化失败: ${err.message}`));
          return;
        }
        this.soapClient = client;
        this.clientReady = true;
        console.log('[BPM客户端] SOAP客户端初始化成功');
        resolve(client);
      });
    });
  }

  /**
   * 调用BPM SOAP方法
   * @param {string} methodName - SOAP方法名
   * @param {Object} args - 方法参数
   * @returns {Promise<Object>} 解析后的响应
   */
  async callSoapMethod(methodName, args) {
    try {
      const client = await this.getClient();
      const method = client[methodName];

      if (!method) {
        throw new Error(`BPM SOAP方法不存在: ${methodName}`);
      }

      console.log(`[BPM客户端] 调用SOAP方法: ${methodName}`, JSON.stringify(args));

      return new Promise((resolve, reject) => {
        method(args, (err, result, rawResponse, soapHeader) => {
          if (err) {
            console.error(`[BPM客户端] SOAP方法 ${methodName} 调用失败:`, err.message);
            reject(err);
            return;
          }
          console.log(`[BPM客户端] SOAP方法 ${methodName} 调用成功`);
          resolve(this.parseResponse(result));
        });
      });
    } catch (error) {
      console.error(`[BPM客户端] SOAP调用失败 [${methodName}]:`, error.message);
      throw error;
    }
  }

  /**
   * 解析BPM SOAP响应
   * @param {Object} result - SOAP响应对象
   * @returns {Object} 解析后的结果
   */
  parseResponse(result) {
    try {
      if (!result) {
        return { success: false, message: 'BPM返回空响应' };
      }

      let data = result;
      if (result.return) {
        data = result.return;
      } else if (result.result) {
        data = result.result;
      }

      if (typeof data === 'string') {
        if (data.startsWith('T:')) {
          const jsonData = data.substring(2);
          try {
            return { success: true, data: JSON.parse(jsonData) };
          } catch {
            return { success: true, data: jsonData };
          }
        } else if (data.startsWith('F:')) {
          return { success: false, message: data.substring(2) };
        } else if (data === 'T') {
          return { success: true };
        }
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('[BPM客户端] 解析响应失败:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 创建BPM流程实例
   * @param {Object} params - 创建流程参数
   * @returns {Promise<Object>} 创建结果
   */
  async createProcess(params) {
    const { flowTemplateId, formInstanceId, creatorLoginName, docSubject, exParam = {} } = params;

    const formId = JSON.stringify({
      sysId: this.sysId,
      modelId: this.modelId,
      templateFormId: this.templateFormId,
      formInstanceId: formInstanceId
    });

    const creator = JSON.stringify({ LoginName: creatorLoginName });

    const exParamStr = JSON.stringify({
      docSubject: docSubject || `${creatorLoginName}的园区权限申请`,
      ...exParam
    });

    const result = await this.callSoapMethod('CreateProcess', {
      flowTemplateId: flowTemplateId || '',
      formId: formId,
      creator: creator,
      exParam: exParamStr,
      language: 'zh_CN'
    });

    return this.parseCreateProcessResult(result);
  }

  /**
   * 解析创建流程的结果（提取processId）
   */
  parseCreateProcessResult(result) {
    if (result.success && result.data) {
      const data = result.data;
      if (typeof data === 'string' && data.startsWith('{')) {
        try {
          const parsed = JSON.parse(data);
          return { success: true, data: { processId: parsed.processId || parsed.fdId || data } };
        } catch {
          return { success: true, data: { processId: data } };
        }
      }
      return { success: true, data: { processId: data } };
    }
    return result;
  }

  /**
   * 审批BPM流程
   * @param {Object} params - 审批参数
   * @returns {Promise<Object>} 审批结果
   */
  async approveProcess(params) {
    const { formInstanceId, processId, handlerLoginName, formData = {}, processParam } = params;

    const formId = JSON.stringify({
      sysId: this.sysId,
      modelId: this.modelId,
      templateFormId: this.templateFormId,
      formInstanceId: formInstanceId
    });

    const handler = JSON.stringify({ LoginName: handlerLoginName });

    return this.callSoapMethod('ApproveProcess', {
      formId: formId,
      processId: processId || '',
      handler: handler,
      formData: JSON.stringify(formData),
      processParam: processParam,
      language: 'zh_CN'
    });
  }

  /**
   * 检查用户是否有审批权限
   * @param {string} formInstanceId - 表单实例ID
   * @param {string} actionUid - 用户登录名
   * @returns {Promise<Object>} 检查结果
   */
  async canApprovalProcess(formInstanceId, actionUid) {
    const formId = JSON.stringify({
      sysId: this.sysId,
      modelId: this.modelId,
      templateFormId: this.templateFormId,
      formInstanceId: formInstanceId
    });

    const actionUidJson = JSON.stringify({ LoginName: actionUid });

    return this.callSoapMethod('CanApprovalProcess', {
      formId: formId,
      actionUid: actionUidJson,
      language: 'zh_CN'
    });
  }

  /**
   * 检查流程实例是否存在
   * @param {string} formInstanceId - 表单实例ID
   * @returns {Promise<Object>} 检查结果
   */
  async isExistProcess(formInstanceId) {
    const formId = JSON.stringify({
      sysId: this.sysId,
      modelId: this.modelId,
      templateFormId: this.templateFormId,
      formInstanceId: formInstanceId
    });

    return this.callSoapMethod('IsExistProcess', {
      formId: formId,
      language: 'zh_CN'
    });
  }

  /**
   * 获取当前处理人的待审流程列表
   * @param {string} actionUid - 用户登录名
   * @param {Object} conditions - 查询条件
   * @returns {Promise<Object>} 待审流程列表
   */
  async getUnApprovingLists(actionUid, conditions = {}) {
    return this.callSoapMethod('GetUnApprovingLists', {
      actionUid: JSON.stringify({ LoginName: actionUid }),
      conditions: JSON.stringify(conditions),
      pageNo: '1',
      pageSize: '20',
      language: 'zh_CN'
    });
  }

  /**
   * 获取当前处理人的已审流程列表
   * @param {string} actionUid - 用户登录名
   * @param {Object} conditions - 查询条件
   * @returns {Promise<Object>} 已审流程列表
   */
  async getApprovedLists(actionUid, conditions = {}) {
    return this.callSoapMethod('GetApprovedLists', {
      actionUid: JSON.stringify({ LoginName: actionUid }),
      conditions: JSON.stringify(conditions),
      pageNo: '1',
      pageSize: '20',
      language: 'zh_CN'
    });
  }

  /**
   * 获取任务信息
   * @param {string} formInstanceId - 表单实例ID
   * @param {string} processId - 流程实例ID
   * @param {string} handlerLoginName - 处理人登录名
   * @returns {Promise<Object>} 任务信息
   */
  async getTasksInfo(formInstanceId, processId, handlerLoginName) {
    const formId = JSON.stringify({
      sysId: this.sysId,
      modelId: this.modelId,
      templateFormId: this.templateFormId,
      formInstanceId: formInstanceId
    });

    return this.callSoapMethod('GetTasksInfo', {
      formId: formId,
      processId: processId || '',
      handler: JSON.stringify({ LoginName: handlerLoginName }),
      language: 'zh_CN'
    });
  }

  /**
   * 删除流程实例
   * @param {string} formInstanceId - 表单实例ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteProcess(formInstanceId) {
    const formId = JSON.stringify({
      sysId: this.sysId,
      modelId: this.modelId,
      templateFormId: this.templateFormId,
      formInstanceId: formInstanceId
    });

    return this.callSoapMethod('DeleteProcess', {
      formId: formId,
      language: 'zh_CN'
    });
  }

  /**
   * 获取BPM审批页面URL
   * @param {string} processId - 流程实例ID
   * @param {string} type - 页面类型（view/edit/mobile）
   * @returns {string} 审批页面URL
   */
  getApprovalPageUrl(processId, type = 'view') {
    const baseUrl = process.env.BPM_PAGE_URL || 'http://bpmtest.xiamenair.com.cn/bpm/sys/lbpmservice/support/lbpm_process/lbpmProcess.do';

    if (type === 'mobile') {
      return `${baseUrl}?type=mobile&method=editProcess&fdId=${processId}`;
    }

    return `${baseUrl}?method=${type}Process&fdId=${processId}`;
  }
}

module.exports = BpmClientService;