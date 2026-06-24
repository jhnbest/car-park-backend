const crypto = require('crypto');
const axios = require('axios');

class JieLinkSigner {
  constructor() {
    this.secretCache = new Map();
  }

  generateTimestamp() {
    return Math.floor(Date.now() / 1000).toString();
  }

  generateRandom() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateSignature(random, timestamp, secretKey) {
    const key = secretKey.toLowerCase();
    const signStr = 'random' + random + 'timestamp' + timestamp + 'key' + key;
    return this.md5(signStr);
  }

  md5(str) {
    return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
  }

  async getDynamicAppSecret(parkId, config) {
    const cacheKey = `jielink_secret_${parkId}`;
    const cached = this.secretCache.get(cacheKey);

    if (cached && cached.expireTime > Date.now()) {
      return cached;
    }

    const secretInstance = axios.create({
      baseURL: config.baseURL,
      timeout: 5000
    });

    try {
      const response = await secretInstance.post('/internal/sign', {
        userName: config.userName,
        password: config.password
      });

      if (response.data && (response.data.code === 0 || response.data.code === '0')) {
        const secretList = response.data.data;
        if (!secretList || secretList.length === 0) {
          throw new Error('获取密钥失败: 返回数据为空');
        }

        const secretData = secretList[0];
        const secretInfo = {
          appId: secretData.appId,
          key: secretData.key,
          expireTime: Date.now() + (55 * 60 * 1000)
        };

        this.secretCache.set(cacheKey, secretInfo);
        console.log(`获取密钥成功, parkId: ${parkId}, appId: ${secretInfo.appId}`);
        return secretInfo;
      } else {
        throw new Error(response.data?.msg || '获取密钥失败');
      }
    } catch (error) {
      console.error(`获取园区 ${parkId} 动态密钥失败:`, error.message);
      throw error;
    }
  }

  async generateSignHeaders(parkId, config) {
    const timestamp = this.generateTimestamp();
    const random = this.generateRandom();

    const secretInfo = await this.getDynamicAppSecret(parkId, config);
    const signature = this.generateSignature(random, timestamp, secretInfo.key);

    return {
      'Content-Type': 'application/json',
      'appId': secretInfo.appId,
      'v': '1.0',
      'random': random,
      'timestamp': timestamp,
      'sign': signature
    };
  }

  clearSecretCache(parkId) {
    if (parkId) {
      const cacheKey = `jielink_secret_${parkId}`;
      this.secretCache.delete(cacheKey);
    }
  }

  clearAllSecretCache() {
    this.secretCache.clear();
  }
}

module.exports = new JieLinkSigner();
