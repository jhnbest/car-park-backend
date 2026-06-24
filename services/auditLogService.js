const AuditLogModel = require('../models/auditLogModel');
const DeviceUtil = require('../utils/deviceUtil');
const IpUtil = require('../utils/ipUtil');

const OPERATION_TYPES = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PERMISSION_CREATE: 'PERMISSION_CREATE',
  PERMISSION_UPDATE: 'PERMISSION_UPDATE',
  PERMISSION_DELETE: 'PERMISSION_DELETE',
  DATA_SYNC: 'DATA_SYNC',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG'
};

const OPERATION_RESULTS = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL'
};

class AuditLogService {
  static OPERATION_TYPES = OPERATION_TYPES;
  static OPERATION_RESULTS = OPERATION_RESULTS;

  static async log(options) {
    try {
      const logData = {
        operation_type: options.operationType,
        user_id: options.userId || null,
        user_name: options.userName || null,
        ip_address: options.ipAddress || null,
        device_info: options.deviceInfo || null,
        user_agent: options.userAgent || null,
        operation_details: options.operationDetails || null,
        before_state: options.beforeState || null,
        after_state: options.afterState || null,
        operation_result: options.operationResult || OPERATION_RESULTS.SUCCESS,
        error_message: options.errorMessage || null,
        business_id: options.businessId || null,
        business_type: options.businessType || null,
        duration: options.duration || null,
        extra_data: options.extraData || null
      };

      await AuditLogModel.create(logData);
      return true;
    } catch (error) {
      console.error('[AuditLogService] Failed to create audit log:', error.message);
      return false;
    }
  }

  static logAsync(options) {
    setImmediate(async () => {
      try {
        await this.log(options);
      } catch (error) {
        console.error('[AuditLogService] Async log failed:', error.message);
      }
    });
  }

  static async logLogin(user, result, ip, deviceInfo, req = null, errorMessage = null) {
    const parsedDevice = DeviceUtil.parseUserAgent(req?.headers?.['user-agent'] || deviceInfo?.userAgent);
    const deviceStr = typeof deviceInfo === 'string' ? deviceInfo : DeviceUtil.formatDeviceInfo(parsedDevice);

    const details = {
      loginName: user?.loginName || user?.username || user?.name || '',
      result: result
    };

    if (errorMessage) {
      details.errorMessage = errorMessage;
    }

    return this.log({
      operationType: OPERATION_TYPES.LOGIN,
      userId: user?.id?.toString() || null,
      userName: user?.name || user?.username || null,
      ipAddress: ip || (req ? IpUtil.getClientIp(req) : null),
      deviceInfo: deviceStr,
      userAgent: req?.headers?.['user-agent'] || null,
      operationDetails: details,
      operationResult: result === 'SUCCESS' ? OPERATION_RESULTS.SUCCESS : OPERATION_RESULTS.FAIL,
      errorMessage: errorMessage,
      businessType: 'AUTH'
    });
  }

  static async logPermission(user, action, beforeState, afterState, targetUserId = null, req = null) {
    const details = {
      action: action,
      targetUserId: targetUserId
    };

    if (action === 'CREATE') {
      details.operation = '创建权限';
    } else if (action === 'UPDATE') {
      details.operation = '更新权限';
    } else if (action === 'DELETE') {
      details.operation = '删除权限';
    }

    let beforeStateJson = null;
    let afterStateJson = null;

    if (beforeState && Object.keys(beforeState).length > 0) {
      beforeStateJson = {
        authorizedParks: beforeState.authorizedParks || [],
        packages: beforeState.packages || []
      };
    }

    if (afterState && Object.keys(afterState).length > 0) {
      afterStateJson = {
        authorizedParks: afterState.authorizedParks || [],
        packages: afterState.packages || []
      };
    }

    return this.log({
      operationType: action === 'CREATE' ? OPERATION_TYPES.PERMISSION_CREATE :
                     action === 'UPDATE' ? OPERATION_TYPES.PERMISSION_UPDATE :
                     OPERATION_TYPES.PERMISSION_DELETE,
      userId: user?.id?.toString() || null,
      userName: user?.name || user?.username || null,
      ipAddress: req ? IpUtil.getClientIp(req) : null,
      deviceInfo: req ? DeviceUtil.formatDeviceInfo(DeviceUtil.parseUserAgent(req.headers?.['user-agent'])) : null,
      userAgent: req?.headers?.['user-agent'] || null,
      operationDetails: details,
      beforeState: beforeStateJson,
      afterState: afterStateJson,
      operationResult: OPERATION_RESULTS.SUCCESS,
      businessId: targetUserId,
      businessType: 'PERMISSION'
    });
  }

  static async query(filters = {}, pagination = { page: 1, pageSize: 20 }) {
    return AuditLogModel.find(filters, pagination);
  }

  static async getById(id) {
    return AuditLogModel.getById(id);
  }

  static async export(filters = {}) {
    const result = await AuditLogModel.find(filters, { page: 1, pageSize: 10000 });
    return result.data || [];
  }

  static async cleanup(daysToKeep = 90) {
    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - daysToKeep);

    const result = await AuditLogModel.deleteBefore(beforeDate);
    return result;
  }

  static async getStats(startTime, endTime) {
    const typeStats = await AuditLogModel.aggregateByType(startTime, endTime);
    const userStats = await AuditLogModel.aggregateByUser(startTime, endTime, 10);
    const trendStats = await AuditLogModel.getTrend(startTime, endTime, 'day');

    return {
      byType: typeStats,
      byUser: userStats,
      trend: trendStats
    };
  }
}

module.exports = AuditLogService;
