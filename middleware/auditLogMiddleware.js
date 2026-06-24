const AuditLogService = require('../services/auditLogService');
const IpUtil = require('../utils/ipUtil');
const DeviceUtil = require('../utils/deviceUtil');

const DEFAULT_EXCLUDED_PATHS = [
  '/api/system/health',
  '/api/system/stats',
  '/favicon.ico',
  '/static/',
  '/public/'
];

const DEFAULT_INCLUDED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

function createAuditLogMiddleware(options = {}) {
  const {
    excludedPaths = DEFAULT_EXCLUDED_PATHS,
    includedMethods = DEFAULT_INCLUDED_METHODS,
    includeAllPaths = false,
    logRequestBody = false,
    logResponseBody = false,
    sensitiveFields = ['password', 'token', 'secret', 'authorization']
  } = options;

  function shouldExclude(path) {
    return excludedPaths.some(excludedPath => {
      if (excludedPath.endsWith('/')) {
        return path.startsWith(excludedPath);
      }
      return path === excludedPath || path.includes(excludedPath);
    });
  }

  function maskSensitiveData(data, fields) {
    if (!data || typeof data !== 'object') return data;

    const masked = Array.isArray(data) ? [...data] : { ...data };

    for (const key of Object.keys(masked)) {
      const lowerKey = key.toLowerCase();
      if (fields.some(field => lowerKey.includes(field.toLowerCase()))) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = maskSensitiveData(masked[key], fields);
      }
    }

    return masked;
  }

  return async (req, res, next) => {
    if (shouldExclude(req.path)) {
      return next();
    }

    if (!includeAllPaths && !includedMethods.includes(req.method)) {
      return next();
    }

    const startTime = Date.now();
    const originalSend = res.send;

    let responseBody = null;

    res.send = function (body) {
      responseBody = body;
      return originalSend.apply(this, arguments);
    };

    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      const durationThreshold = 1000;

      if (duration < durationThreshold && res.statusCode < 400) {
        return;
      }

      try {
        const userAgent = req.headers['user-agent'] || '';
        const deviceInfo = DeviceUtil.formatDeviceInfo(DeviceUtil.parseUserAgent(userAgent));
        const ipAddress = IpUtil.getClientIp(req);

        let requestData = null;
        if (logRequestBody && req.body) {
          requestData = maskSensitiveData(req.body, sensitiveFields);
        }

        let responseData = null;
        if (logResponseBody && responseBody) {
          try {
            responseData = maskSensitiveData(JSON.parse(responseBody), sensitiveFields);
          } catch (e) {
            responseData = responseBody;
          }
        }

        const operationType = req.method === 'GET' ? 'QUERY' :
                             req.method === 'POST' ? 'CREATE' :
                             req.method === 'PUT' || req.method === 'PATCH' ? 'UPDATE' :
                             req.method === 'DELETE' ? 'DELETE' : 'OTHER';

        await AuditLogService.log({
          operationType: `HTTP_${operationType}`,
          userId: req.user?.id?.toString() || null,
          userName: req.user?.name || req.user?.username || null,
          ipAddress: ipAddress,
          deviceInfo: deviceInfo,
          userAgent: userAgent,
          operationDetails: {
            method: req.method,
            path: req.path,
            query: req.query,
            requestData: requestData
          },
          operationResult: res.statusCode < 400 ? 'SUCCESS' : 'FAIL',
          errorMessage: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : null,
          businessType: 'HTTP_REQUEST',
          duration: duration,
          extraData: logResponseBody ? { responseData } : null
        });
      } catch (error) {
        console.error('[AuditLogMiddleware] Failed to log request:', error.message);
      }
    });

    next();
  };
}

module.exports = createAuditLogMiddleware;
