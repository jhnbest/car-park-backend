const axios = require('axios');
const crypto = require('crypto');

// HMAC认证配置（应该从环境变量中获取）
const HMAC_USERNAME = process.env.HMAC_USERNAME || '23011997';
const HMAC_SECRET = process.env.HMAC_SECRET || 'c20e5a27-4bfb-4d17-a9a0-eb3bf70baca6';
const HMAC_ALGORITHM = 'hmac-sha256';
const HMAC_HEADERS = 'date';

/**
 * 创建独立的axios实例，避免修改全局配置
 */
const httpInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/', // 使用实例配置，不修改全局
  timeout: 10000 // 10秒超时
});

/**
 * 生成HMAC-SHA256签名
 * @param {string} data - 要签名的数据
 * @param {string} key - 密钥
 * @returns {Buffer} 签名结果
 */
function generateHMACSignature(data, key) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

/**
 * 对请求体进行SHA-256加密
 * @param {string} body - 请求体内容
 * @returns {string} Base64编码的摘要
 */
function encryptRequestBody(body) {
  if (!body) return '';
  const hash = crypto.createHash('sha256').update(body).digest();
  return Buffer.from(hash).toString('base64');
}

/**
 * 生成GMT格式的时间字符串
 * @returns {string} GMT时间字符串
 */
function generateGMTTime() {
  const date = new Date();
  const options = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'GMT',
    timeZoneName: 'short'
  };
  
  return date.toLocaleString('en-US', options).replace(',', '');
}

// 请求拦截器 - 添加HMAC认证信息和签名
httpInstance.interceptors.request.use(config => {
  // 生成GMT时间
  const gmtTime = generateGMTTime();
  
  // 构建签名内容
  let signatureContent = `date: ${gmtTime}`;
  
  // 如果需要验证请求体，添加digest到签名内容
  const validateRequestBody = process.env.VALIDATE_REQUEST_BODY === 'true';
  if (validateRequestBody && config.data) {
    const requestBody = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    const digest = encryptRequestBody(requestBody);
    signatureContent += `\ndigest: SHA-256=${digest}`;
    config.headers['Digest'] = `SHA-256=${digest}`;
  }
  
  // 生成HMAC签名
  const signatureBytes = generateHMACSignature(signatureContent, HMAC_SECRET);
  const signature = Buffer.from(signatureBytes).toString('base64');
  
  // 构建Authorization头
  const headersList = validateRequestBody && config.data ? 'date digest' : 'date';
  const authorizationHeader = `hmac username="${HMAC_USERNAME}", algorithm="${HMAC_ALGORITHM}", headers="${headersList}", signature="${signature}"`;
  
  // 设置请求头
  config.headers['Content-Type'] = 'application/json';
  config.headers['Authorization'] = authorizationHeader;
  config.headers['Date'] = gmtTime;

  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器 - 统一处理响应和错误
httpInstance.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data;
  },
  error => {
    const errorMessage = error.response?.data?.message || error.message;
    const errorCode = error.response?.status;
    
    console.error(`HTTP请求失败 [${errorCode}]:`, errorMessage);
    
    return Promise.reject({
      code: errorCode,
      message: errorMessage,
      response: error.response
    });
  }
);

/**
 * 封装HTTP请求方法
 * @param {string} method - 请求方法：get、post、put、delete等
 * @param {string} url - 请求URL
 * @param {object} data - 请求数据（对于post、put、patch）
 * @param {object} params - URL参数（对于get、delete）
 * @param {object} options - 额外配置选项
 * @returns {Promise} 请求Promise
 */
function request(method, url, data = null, params = null, options = {}) {
  const config = {
    method,
    url,
    ...options
  };

  if (data) {
    config.data = data;
  }

  if (params) {
    config.params = params;
  }

  return httpInstance(config); // 使用独立的httpInstance，而不是全局axios
}

// 具体的HTTP方法封装
const http = {
  /**
   * GET请求
   * @param {string} url - 请求URL
   * @param {object} params - URL参数
   * @param {object} options - 额外配置
   */
  get: (url, params = null, options = {}) => 
    request('get', url, null, params, options),

  /**
   * POST请求
   * @param {string} url - 请求URL
   * @param {object} data - 请求体数据
   * @param {object} options - 额外配置
   */
  post: (url, data = null, options = {}) => 
    request('post', url, data, null, options),

  /**
   * PUT请求
   * @param {string} url - 请求URL
   * @param {object} data - 请求体数据
   * @param {object} options - 额外配置
   */
  put: (url, data = null, options = {}) => 
    request('put', url, data, null, options),

  /**
   * DELETE请求
   * @param {string} url - 请求URL
   * @param {object} params - URL参数
   * @param {object} options - 额外配置
   */
  delete: (url, params = null, options = {}) => 
    request('delete', url, null, params, options),

  /**
   * 下载文件
   * @param {string} url - 下载URL
   * @param {object} data - 请求数据
   * @param {string} filename - 下载文件名
   */
  download: (url, data = null, filename = 'download') => {
    return request('post', url, data, null, {
      responseType: 'blob'
    }).then(response => {
      // 创建blob链接并触发下载
      const blob = new Blob([response]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
      return response;
    });
  }
};

module.exports = http;