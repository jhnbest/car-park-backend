const db = require('../config/db');

/**
 * BPM SOAP接口服务 - 业务系统需要实现的供BPM调用的接口
 * 按照BPM流程引擎对接教程文档实现
 */
class BpmSoapService {
  /**
   * 获取业务表单模板列表 - BPM必须调用的接口
   * BPM在配置流程模板时需要调用此接口获取业务系统的表单模板信息
   * @param {string} sysId - 业务系统标识
   * @param {string} language - 语种
   * @returns {string} JSON字符串格式的表单模板列表
   */
  static async getTemplateFormList(sysId, language = 'zh_CN') {
    try {
      console.log(`[BPM回调] getTemplateFormList - sysId: ${sysId}, language: ${language}`);

      // 根据sysId返回对应的表单模板
      // 这里根据实际业务系统配置相应的模板
      const templates = [
        {
          modelId: 'permission-apply',
          modelName: '园区权限申请',
          templateFormId: 'park-permission-form',
          templateFormName: '园区权限申请表',
          formUrl: `${process.env.BASE_URL || 'http://11.22.232.27:13333'}`
        }
      ];

      // 如果sysId不匹配，返回空数组
      if (sysId && sysId !== 'cldz' && sysId !== '*') {
        console.warn(`[BPM回调] sysId不匹配: ${sysId}`);
        return JSON.stringify([]);
      }

      return JSON.stringify(templates);
    } catch (error) {
      console.error('[BPM回调] getTemplateFormList失败:', error);
      throw error;
    }
  }

  /**
   * 获取业务表单字段列表
   * BPM在配置流程模板关联业务表单字段时会调用此接口
   * @param {string} sysId - 业务系统标识
   * @param {string} modelId - 业务模块标识
   * @param {string} templateFormId - 表单模板标识
   * @param {string} language - 语种
   * @returns {string} JSON字符串格式的字段列表
   */
  static async getFormFieldList(sysId, modelId, templateFormId, language = 'zh_CN') {
    try {
      console.log(`[BPM回调] getFormFieldList - sysId: ${sysId}, modelId: ${modelId}, templateFormId: ${templateFormId}`);

      // 定义权限申请的表单字段
      const fields = [
        { fieldId: 'emp_id', fieldName: '申请人工号', type: 'String' },
        { fieldId: 'emp_name', fieldName: '申请人姓名', type: 'String' },
        { fieldId: 'park_id', fieldName: '园区ID', type: 'Number' },
        { fieldId: 'park_name', fieldName: '园区名称', type: 'String' },
        { fieldId: 'apply_type', fieldName: '申请类型', type: 'String' },
        { fieldId: 'credential_no', fieldName: '车牌号码', type: 'String' },
        { fieldId: 'mobile', fieldName: '联系电话', type: 'String' },
        { fieldId: 'remark', fieldName: '申请理由', type: 'String' }
      ];

      return JSON.stringify(fields);
    } catch (error) {
      console.error('[BPM回调] getFormFieldList失败:', error);
      throw error;
    }
  }

  /**
   * 获取业务表单字段值
   * BPM在流程流转中需要获取表单字段值时会调用此接口
   * @param {string} sysId - 业务系统标识
   * @param {string} modelId - 业务模块标识
   * @param {string} templateFormId - 表单模板标识
   * @param {string} formInstanceId - 表单实例ID
   * @param {string} fieldIds - 字段ID列表（逗号或分号分隔）
   * @param {string} language - 语种
   * @returns {string} JSON字符串格式的字段值列表
   */
  static async getFormFieldValueList(sysId, modelId, templateFormId, formInstanceId, fieldIds, language = 'zh_CN') {
    try {
      console.log(`[BPM回调] getFormFieldValueList - formInstanceId: ${formInstanceId}, fieldIds: ${fieldIds}`);

      // 从数据库获取表单实例数据
      const result = await db.query(
        `SELECT * FROM "JHN"."park_staff_permission_apply" WHERE "apply_id" = ?`,
        [formInstanceId]
      );

      if (!result || result.length === 0) {
        console.warn(`[BPM回调] 未找到表单实例: ${formInstanceId}`);
        return JSON.stringify([]);
      }

      const formData = result[0];
      const fieldValues = [];

      // 如果没有指定字段ID，返回所有字段
      const targetFields = fieldIds 
        ? fieldIds.split(/[;,]/) 
        : ['emp_id', 'emp_name', 'park_id', 'park_name', 'apply_type', 'credential_no', 'mobile', 'remark'];

      const fieldMapping = {
        'emp_id': formData.emp_id,
        'emp_name': formData.emp_name,
        'park_id': formData.park_id,
        'park_name': formData.park_name,
        'apply_type': formData.apply_type,
        'credential_no': formData.credential_no,
        'mobile': formData.mobile,
        'remark': formData.remark
      };

      for (const fieldId of targetFields) {
        if (fieldMapping[fieldId] !== undefined) {
          fieldValues.push({
            fieldId: fieldId,
            fieldValue: fieldMapping[fieldId] || ''
          });
        }
      }

      return JSON.stringify(fieldValues);
    } catch (error) {
      console.error('[BPM回调] getFormFieldValueList失败:', error);
      throw error;
    }
  }

  /**
   * 获取业务逻辑方法列表
   * BPM在配置流程事件监听器时需要调用此接口获取可选的业务方法
   * @param {string} sysId - 业务系统标识
   * @param {string} modelId - 业务模块标识
   * @param {string} templateFormId - 表单模板标识
   * @param {string} language - 语种
   * @returns {string} JSON字符串格式的方法列表
   */
  static async getMethodInfo(sysId, modelId, templateFormId, language = 'zh_CN') {
    try {
      console.log(`[BPM回调] getMethodInfo - sysId: ${sysId}, modelId: ${modelId}, templateFormId: ${templateFormId}`);

      const methods = [
        {
          functionId: 'updatePermissionStatus',
          functionName: '更新权限状态',
          functionDes: '根据流程节点ID更新权限申请状态'
        },
        {
          functionId: 'notifyApplicant',
          functionName: '通知申请人',
          functionDes: '流程审批完成后通知申请人结果'
        },
        {
          functionId: 'addParkPermission',
          functionName: '新增园区权限',
          functionDes: '审批通过后执行新增园区权限的业务逻辑'
        }
      ];

      return JSON.stringify(methods);
    } catch (error) {
      console.error('[BPM回调] getMethodInfo失败:', error);
      throw error;
    }
  }

  /**
   * 执行业务逻辑方法
   * BPM在流程事件触发时会调用此接口执行业务逻辑
   * @param {Object} params - 方法参数
   * @returns {string} 成功返回"T"，失败返回"F：错误信息"
   */
  static async doMethodProcess(params) {
    try {
      const { formId, functionId, processData, language } = params;
      console.log(`[BPM回调] doMethodProcess - functionId: ${functionId}, formId: ${formId}`);

      let formIdObj;
      try {
        formIdObj = typeof formId === 'string' ? JSON.parse(formId) : formId;
      } catch (e) {
        return 'F：formId格式错误';
      }

      const { formInstanceId } = formIdObj;

      switch (functionId) {
        case 'updatePermissionStatus':
          await this.updatePermissionStatusByProcess(formInstanceId, processData);
          return 'T';

        case 'notifyApplicant':
          await this.notifyApplicantByProcess(formInstanceId, processData);
          return 'T';

        case 'addParkPermission':
          await this.addParkPermissionByProcess(formInstanceId, processData);
          return 'T';

        default:
          return `F：未知的functionId: ${functionId}`;
      }
    } catch (error) {
      console.error('[BPM回调] doMethodProcess失败:', error);
      return `F：${error.message}`;
    }
  }

  /**
   * 根据流程数据更新权限申请状态
   * @param {string} formInstanceId - 表单实例ID
   * @param {Object} processData - 流程数据
   */
  static async updatePermissionStatusByProcess(formInstanceId, processData) {
    try {
      let status = 'pending';
      
      // 根据流程节点判断状态
      // 这里需要根据实际的流程状态来判断
      // 流程结束通常意味着审批通过
      if (processData && processData.nodeFactId) {
        // 可以根据节点信息判断状态
        console.log(`[业务逻辑] 更新权限申请状态 - formInstanceId: ${formInstanceId}, nodeFactId: ${processData.nodeFactId}`);
      }

      // 更新数据库中的状态
      await db.query(
        `UPDATE "JHN"."park_staff_permission_apply" 
         SET "status" = ?, "update_time" = GETDATE() 
         WHERE "apply_id" = ?`,
        [status, formInstanceId]
      );

      console.log(`[业务逻辑] 权限申请状态已更新 - applyId: ${formInstanceId}, status: ${status}`);
    } catch (error) {
      console.error('[业务逻辑] 更新权限申请状态失败:', error);
      throw error;
    }
  }

  /**
   * 通知申请人
   * @param {string} formInstanceId - 表单实例ID
   * @param {Object} processData - 流程数据
   */
  static async notifyApplicantByProcess(formInstanceId, processData) {
    try {
      // 获取申请人信息
      const result = await db.query(
        `SELECT emp_id, emp_name, mobile FROM "JHN"."park_staff_permission_apply" WHERE "apply_id" = ?`,
        [formInstanceId]
      );

      if (result && result.length > 0) {
        const { emp_id, emp_name, mobile } = result[0];
        console.log(`[业务逻辑] 发送通知 - 申请人: ${emp_name}(${emp_id}), 手机: ${mobile}`);
        // 实际实现中，这里可以调用短信或邮件服务发送通知
      }
    } catch (error) {
      console.error('[业务逻辑] 发送通知失败:', error);
      throw error;
    }
  }

  /**
   * 新增园区权限
   * 当流程审批通过后，BPM会回调此方法执行业务逻辑
   * @param {string} formInstanceId - 表单实例ID
   * @param {Object} processData - 流程数据
   */
  static async addParkPermissionByProcess(formInstanceId, processData) {
    try {
      console.log(`[业务逻辑] 新增园区权限 - formInstanceId: ${formInstanceId}, processData:`, processData);

      // 获取权限申请详情
      const result = await db.query(
        `SELECT * FROM "JHN"."park_staff_permission_apply" WHERE "apply_id" = ?`,
        [formInstanceId]
      );

      if (!result || result.length === 0) {
        console.warn(`[业务逻辑] 未找到权限申请记录 - applyId: ${formInstanceId}`);
        throw new Error('权限申请记录不存在');
      }

      const applyData = result[0];

      // 检查申请状态是否为待审批（只有待审批的才能新增权限）
      if (applyData.status !== 'pending') {
        console.warn(`[业务逻辑] 权限申请状态不是待审批 - status: ${applyData.status}`);
        throw new Error('权限申请状态不是待审批');
      }

      // 根据申请类型执行相应的权限操作
      switch (applyData.apply_type) {
        case 'new':
          // 新增权限 - 在权限表中插入新记录
          await this.addNewPermission(applyData);
          break;
        case 'renew':
          // 权限续期 - 更新权限表的有效期
          await this.renewPermission(applyData);
          break;
        case 'modify':
          // 权限变更 - 更新权限信息
          await this.modifyPermission(applyData);
          break;
        default:
          console.warn(`[业务逻辑] 未知的申请类型 - applyType: ${applyData.apply_type}`);
      }

      // 更新权限申请状态为已通过
      await db.query(
        `UPDATE "JHN"."park_staff_permission_apply" 
         SET "status" = 'approved', "update_time" = GETDATE() 
         WHERE "apply_id" = ?`,
        [formInstanceId]
      );

      console.log(`[业务逻辑] 园区权限新增成功 - applyId: ${formInstanceId}`);
    } catch (error) {
      console.error('[业务逻辑] 新增园区权限失败:', error);
      throw error;
    }
  }

  /**
   * 新增权限记录
   * @param {Object} applyData - 申请数据
   */
  static async addNewPermission(applyData) {
    try {
      // 生成权限ID
      const permissionId = `PERM${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // 插入权限记录
      await db.query(
        `INSERT INTO "JHN"."park_staff_permission" (
           "permission_id", "emp_id", "emp_name", "park_id", "park_name",
           "credential_no", "mobile", "permission_type", "status",
           "start_date", "end_date", "create_time"
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', GETDATE(), DATEADD(YEAR, 1, GETDATE()), GETDATE())`,
        [
          permissionId,
          applyData.emp_id,
          applyData.emp_name,
          applyData.park_id,
          applyData.park_name,
          applyData.credential_no || '',
          applyData.mobile || '',
          applyData.apply_type
        ]
      );

      console.log(`[业务逻辑] 新增权限记录 - permissionId: ${permissionId}, empId: ${applyData.emp_id}`);
    } catch (error) {
      console.error('[业务逻辑] 新增权限记录失败:', error);
      throw error;
    }
  }

  /**
   * 续期权限
   * @param {Object} applyData - 申请数据
   */
  static async renewPermission(applyData) {
    try {
      // 查询现有权限
      const existing = await db.query(
        `SELECT TOP 1 "id", "permission_id" FROM "JHN"."park_staff_permission" 
         WHERE "emp_id" = ? AND "park_id" = ? AND "status" = 'active'
         ORDER BY "create_time" DESC`,
        [applyData.emp_id, applyData.park_id]
      );

      if (existing && existing.length > 0) {
        // 更新有效期
        await db.query(
          `UPDATE "JHN"."park_staff_permission" 
           SET "end_date" = DATEADD(YEAR, 1, GETDATE()), "update_time" = GETDATE()
           WHERE "id" = ?`,
          [existing[0].id]
        );
        console.log(`[业务逻辑] 权限续期成功 - permissionId: ${existing[0].permission_id}`);
      } else {
        // 如果没有现有权限，则新增
        await this.addNewPermission(applyData);
      }
    } catch (error) {
      console.error('[业务逻辑] 续期权限失败:', error);
      throw error;
    }
  }

  /**
   * 变更权限
   * @param {Object} applyData - 申请数据
   */
  static async modifyPermission(applyData) {
    try {
      // 查询现有权限
      const existing = await db.query(
        `SELECT TOP 1 "id", "permission_id" FROM "JHN"."park_staff_permission" 
         WHERE "emp_id" = ? AND "park_id" = ? AND "status" = 'active'
         ORDER BY "create_time" DESC`,
        [applyData.emp_id, applyData.park_id]
      );

      if (existing && existing.length > 0) {
        // 更新权限信息
        await db.query(
          `UPDATE "JHN"."park_staff_permission" 
           SET "credential_no" = ?, "mobile" = ?, "update_time" = GETDATE()
           WHERE "id" = ?`,
          [applyData.credential_no || '', applyData.mobile || '', existing[0].id]
        );
        console.log(`[业务逻辑] 权限变更成功 - permissionId: ${existing[0].permission_id}`);
      } else {
        // 如果没有现有权限，则新增
        await this.addNewPermission(applyData);
      }
    } catch (error) {
      console.error('[业务逻辑] 变更权限失败:', error);
      throw error;
    }
  }

  /**
   * 动态获取流程审批人
   * BPM在公式定义器中设置节点处理人时会调用此接口
   * @param {string} sysId - 业务系统标识
   * @param {string} modelId - 业务模块标识
   * @param {string} templateFormId - 表单模板标识
   * @param {string} formInstanceId - 表单实例ID
   * @param {string} nodeId - 节点ID
   * @param {string} nodeName - 节点名称
   * @param {string} language - 语种
   * @returns {string} JSON字符串格式的处理人列表
   */
  static async getBusinessOrg(sysId, modelId, templateFormId, formInstanceId, nodeId, nodeName, language = 'zh_CN') {
    try {
      console.log(`[BPM回调] getBusinessOrg - nodeId: ${nodeId}, nodeName: ${nodeName}, formInstanceId: ${formInstanceId}`);

      // 根据节点ID和表单数据动态计算审批人
      // 这里需要根据实际业务逻辑来实现
      let handlers = [];

      // 示例：根据不同的节点返回不同的审批人
      if (nodeName && nodeName.includes('部门领导')) {
        // 查询部门领导
        handlers = [{ LoginName: 'admin' }]; // 示例数据
      } else if (nodeName && nodeName.includes('管理员')) {
        // 查询系统管理员
        handlers = [{ LoginName: 'admin' }];
      }

      return JSON.stringify(handlers);
    } catch (error) {
      console.error('[BPM回调] getBusinessOrg失败:', error);
      throw error;
    }
  }

  /**
   * 同步流程模板信息
   * BPM在流程模板同步时会调用此接口
   * @param {string} sysId - 业务系统标识
   * @param {string} flowDefinitionId - 流程定义ID
   * @param {string} flowTemplateId - 流程模板ID
   * @param {string} operationType - 操作类型
   * @param {string} language - 语种
   * @returns {string} 成功返回"T"，失败返回"F：错误信息"
   */
  static async synchronizeTemplate(sysId, flowDefinitionId, flowTemplateId, operationType, language = 'zh_CN') {
    try {
      console.log(`[BPM回调] synchronizeTemplate - flowTemplateId: ${flowTemplateId}, operationType: ${operationType}`);

      // 根据操作类型执行相应的同步逻辑
      switch (operationType) {
        case 'add':
          console.log('[BPM回调] 新建流程模板同步');
          break;
        case 'update':
          console.log('[BPM回调] 更新流程模板同步');
          break;
        case 'delete':
          console.log('[BPM回调] 删除流程模板同步');
          break;
        default:
          console.warn(`[BPM回调] 未知的操作类型: ${operationType}`);
      }

      return 'T';
    } catch (error) {
      console.error('[BPM回调] synchronizeTemplate失败:', error);
      return `F：${error.message}`;
    }
  }
}

module.exports = BpmSoapService;
