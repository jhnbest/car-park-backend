const express = require('express');
const router = express.Router();
const jieLinkSigner = require('../utils/jieLinkSigner');
const parkApiConfig = require('../config/park-api-config');
const axios = require('axios');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/:parkId/:path', authenticateToken, async (req, res) => {
  const { parkId, path } = req.params;
  const data = req.body;

  try {
    const config = parkApiConfig.getParkConfig(parkId);
    if (!config || !config.baseURL) {
      return res.status(400).json({
        success: false,
        message: `园区 ${parkId} 的API配置不存在`
      });
    }

    const signHeaders = await jieLinkSigner.generateSignHeaders(parkId, config);
    const url = `/${path}`;

    const response = await axios.post(
      `${config.baseURL}${url}`,
      data,
      { headers: signHeaders }
    );

    res.json(response.data);
  } catch (error) {
    console.error(`签名代理POST请求失败 - parkId: ${parkId}, path: ${path}:`, error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message,
      data: error.response?.data
    });
  }
});

router.post('/:parkId/:path/:subPath', authenticateToken, async (req, res) => {
  const { parkId, path, subPath } = req.params;
  const data = req.body;

  try {
    const config = parkApiConfig.getParkConfig(parkId);
    if (!config || !config.baseURL) {
      return res.status(400).json({
        success: false,
        message: `园区 ${parkId} 的API配置不存在`
      });
    }

    const signHeaders = await jieLinkSigner.generateSignHeaders(parkId, config);
    const url = `/${path}/${subPath}`;

    const response = await axios.post(
      `${config.baseURL}${url}`,
      data,
      { headers: signHeaders }
    );

    res.json(response.data);
  } catch (error) {
    console.error(`签名代理POST请求失败 - parkId: ${parkId}, path: ${path}/${subPath}:`, error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message,
      data: error.response?.data
    });
  }
});

router.get('/:parkId/:path', authenticateToken, async (req, res) => {
  const { parkId, path } = req.params;
  const params = req.query;

  try {
    const config = parkApiConfig.getParkConfig(parkId);
    if (!config || !config.baseURL) {
      return res.status(400).json({
        success: false,
        message: `园区 ${parkId} 的API配置不存在`
      });
    }

    const signHeaders = await jieLinkSigner.generateSignHeaders(parkId, config);
    const url = `/${path}`;

    const response = await axios.get(
      `${config.baseURL}${url}`,
      { headers: signHeaders, params }
    );

    res.json(response.data);
  } catch (error) {
    console.error(`签名代理GET请求失败 - parkId: ${parkId}, path: ${path}:`, error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message,
      data: error.response?.data
    });
  }
});

router.get('/:parkId/:path/:subPath', authenticateToken, async (req, res) => {
  const { parkId, path, subPath } = req.params;
  const params = req.query;

  try {
    const config = parkApiConfig.getParkConfig(parkId);
    if (!config || !config.baseURL) {
      return res.status(400).json({
        success: false,
        message: `园区 ${parkId} 的API配置不存在`
      });
    }

    const signHeaders = await jieLinkSigner.generateSignHeaders(parkId, config);
    const url = `/${path}/${subPath}`;

    const response = await axios.get(
      `${config.baseURL}${url}`,
      { headers: signHeaders, params }
    );

    res.json(response.data);
  } catch (error) {
    console.error(`签名代理GET请求失败 - parkId: ${parkId}, path: ${path}/${subPath}:`, error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message,
      data: error.response?.data
    });
  }
});

module.exports = router;
