const axios = require('axios');
const crypto = require('crypto');

/**
 * 服务治理中心HMAC认证工具类
 * 用于访问服务治理中心的API时进行身份认证
 */
class HmacAuthClient {
  /**
   * 构造函数
   * @param {Object} config - 认证配置
   */
  constructor(config = {}) {
    this.username = config.username || process.env.GATEWAY_HMAC_USERNAME || '23011997';
    this.secret = config.secret || process.env.GATEWAY_HMAC_SECRET || 'c20e5a27-4bfb-4d17-a9a0-eb3bf70baca6';
    this.algorithm = config.algorithm || 'hmac-sha256';
    this.headers = config.headers || 'date';
    this.baseURL = config.baseURL || process.env.GATEWAY_API_URL || '';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupRequestInterceptor();
  }

  /**
   * 生成HMAC-SHA256签名
   * @param {string} data - 要签名的数据
   * @param {string} key - 密钥
   * @returns {string} Base64编码的签名
   */
  generateSignature(data, key) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(data);
    return Buffer.from(hmac.digest()).toString('base64');
  }

  /**
   * 生成GMT格式的时间字符串
   * @returns {string} GMT时间字符串
   */
  generateGMTTime() {
    const date = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = days[date.getUTCDay()];
    const month = months[date.getUTCMonth()];
    const dayNum = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${day}, ${dayNum} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
  }

  /**
   * 设置请求拦截器 - 添加HMAC认证信息
   */
  setupRequestInterceptor() {
    this.client.interceptors.request.use(async (config) => {
      const gmtTime = this.generateGMTTime();

      let signatureContent = `date: ${gmtTime}`;
      const headersList = 'date';

      const signature = this.generateSignature(signatureContent, this.secret);

      const authorizationHeader = `hmac username="${this.username}", algorithm="${this.algorithm}", headers="${headersList}", signature="${signature}"`;

      config.headers['Authorization'] = authorizationHeader;
      config.headers['Date'] = gmtTime;

      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const errorMessage = error.response?.data?.msg ||
                           error.response?.data?.message ||
                           error.message;
        const errorCode = error.response?.status;

        console.error(`[HmacAuthClient] 请求失败 [${errorCode}]:`, errorMessage);

        return Promise.reject({
          code: errorCode,
          message: errorMessage,
          response: error.response
        });
      }
    );
  }

  /**
   * 发送GET请求
   * @param {string} url - 请求URL
   * @param {Object} params - URL参数
   * @param {Object} options - 配置选项
   * @returns {Promise} 响应数据
   */
  async get(url, params = null, options = {}) {
    return this.client.get(url, { params, ...options });
  }

  /**
   * 发送POST请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 配置选项
   * @returns {Promise} 响应数据
   */
  async post(url, data = null, options = {}) {
    return this.client.post(url, data, options);
  }

  /**
   * 发送PUT请求
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 配置选项
   * @returns {Promise} 响应数据
   */
  async put(url, data = null, options = {}) {
    return this.client.put(url, data, options);
  }

  /**
   * 发送DELETE请求
   * @param {string} url - 请求URL
   * @param {Object} params - URL参数
   * @param {Object} options - 配置选项
   * @returns {Promise} 响应数据
   */
  async delete(url, params = null, options = {}) {
    return this.client.delete(url, { params, ...options });
  }
}

module.exports = HmacAuthClient;
