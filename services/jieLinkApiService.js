const axios = require('axios');
const parkApiConfig = require('../config/park-api-config');
const jieLinkSigner = require('../utils/jieLinkSigner');

class JieLinkApiService {
  constructor() {
  }

  getMaxPageSize(parkId, defaultSize = 50) {
    const config = parkApiConfig.getParkConfig(parkId);
    const apiVersion = config?.apiVersion || '2.x';
    return apiVersion.startsWith('3') ? defaultSize : 50;
  }

  getInstance(parkId) {
    const config = parkApiConfig.getParkConfig(parkId);
    if (!config || !config.baseURL) {
      throw new Error(`园区 ${parkId} 的API配置不存在`);
    }

    const instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || parkApiConfig.getDefaultOptions().timeout
    });

    instance.interceptors.request.use(async (reqConfig) => {
      try {
        const signHeaders = await jieLinkSigner.generateSignHeaders(parkId, config);
        Object.assign(reqConfig.headers, signHeaders);
      } catch (error) {
        console.warn(`获取园区 ${parkId} 签名失败:`, error.message);
      }
      return reqConfig;
    });

    return instance;
  }

  async getDynamicAppSecret(parkId) {
    const config = parkApiConfig.getParkConfig(parkId);
    return jieLinkSigner.getDynamicAppSecret(parkId, config);
  }

  async post(parkId, url, data = null) {
    try {
      const instance = this.getInstance(parkId);
      const response = await instance.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`POST请求失败 - parkId: ${parkId}, url: ${url}, error:`, error.message);
      if (error.response) {
        console.error('错误响应数据:', error.response.data);
      }
      throw error;
    }
  }

  async getPersonList(parkId, pageIndex = 1, pageSize = 100, compareRule = null) {
    const maxPageSize = this.getMaxPageSize(parkId, 100);
    const params = { pageIndex, pageSize: Math.min(pageSize, maxPageSize), compareRule };
    const result = await this.post(parkId, '/base/personlist', params);
    return result;
  }

  async addPerson(parkId, personData) {
    const params = {
      personName: personData.personName,
      mobile: personData.mobile,
      remark: personData.remark || ''
    };
    return this.post(parkId, '/base/addperson', params);
  }

  async deletePerson(parkId, personId) {
    return this.post(parkId, '/base/deleteperson', { personId });
  }

  async getInParkingRecords(parkId, startTime, endTime, pageIndex = 1, pageSize = 50) {
    const maxPageSize = this.getMaxPageSize(parkId, 50);
    const params = { pageIndex, pageSize: Math.min(pageSize, maxPageSize), startTime, endTime };
    const result = await this.post(parkId, '/park/inparkingrecord', params);
    return result;
  }

  async downloadParkCredential(parkId, requestData) {
    return this.post(parkId, '/park/downparkcredential', requestData);
  }

  async getVoucherList(parkId, voucherNo, pageIndex = 1, pageSize = 100) {
    const maxPageSize = this.getMaxPageSize(parkId, 100);
    const params = {
      pageIndex,
      pageSize: Math.min(pageSize, maxPageSize),
      voucherNo
    };
    const result = await this.post(parkId, '/base/vouchers', params);
    return result;
  }

  async getDeviceAccessPoints(parkId) {
    const result = await this.post(parkId, '/base/deviceAccessPoints', {});
    return result;
  }
}

module.exports = new JieLinkApiService();
