/**
 * 园区第三方API配置
 * 每个园区可能有不同的API地址和认证信息
 */

const fs = require('fs');
const path = require('path');

let parkApiConfig = {};

const configPath = path.join(__dirname, '../config/park-api-config.json');

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      parkApiConfig = JSON.parse(data);
    } else {
      parkApiConfig = getDefaultConfig();
      saveConfig(parkApiConfig);
    }
  } catch (error) {
    console.error('加载园区API配置失败:', error.message);
    parkApiConfig = getDefaultConfig();
  }
  return parkApiConfig;
}

function getDefaultConfig() {
  return {
    version: '1.0',
    timeout: 15000,
    parks: {}
  };
}

function saveConfig(config) {
  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('保存园区API配置失败:', error.message);
  }
}

function getParkConfig(parkId) {
  if (!parkApiConfig.parks) {
    loadConfig();
  }
  return parkApiConfig.parks[parkId] || null;
}

function setParkConfig(parkId, config) {
  loadConfig();
  parkApiConfig.parks[parkId] = {
    ...config,
    updatedAt: new Date().toISOString()
  };
  saveConfig(parkApiConfig);
  return parkApiConfig.parks[parkId];
}

function getAllParks() {
  loadConfig();
  return parkApiConfig.parks || {};
}

function getDefaultOptions() {
  loadConfig();
  return {
    version: parkApiConfig.version || '1.0',
    timeout: parkApiConfig.timeout || 15000
  };
}

module.exports = {
  loadConfig,
  getParkConfig,
  setParkConfig,
  getAllParks,
  getDefaultOptions,
  configPath
};
