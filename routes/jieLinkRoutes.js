const express = require('express');
const router = express.Router();
const jieLinkApiService = require('../services/jieLinkApiService');
const parkApiConfig = require('../config/park-api-config');
const ParkCacheService = require('../services/parkCacheService');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * 捷顺API转发路由
 * 前端通过此路由统一调用第三方捷顺系统
 */

// 获取园区API配置列表
router.get('/parks/config', authenticateToken, async (req, res) => {
  try {
    const parks = parkApiConfig.getAllParks();
    res.json({
      success: true,
      data: parks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 设置园区API配置
router.post('/parks/config', authenticateToken, async (req, res) => {
  try {
    const { parkId, baseURL, userName, password, timeout } = req.body;
    
    if (!parkId || !baseURL || !userName || !password) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：parkId, baseURL, userName, password'
      });
    }

    const config = parkApiConfig.setParkConfig(parkId, {
      baseURL,
      userName,
      password,
      timeout
    });

    res.json({
      success: true,
      message: '园区API配置保存成功',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取人员列表
router.get('/person/list', authenticateToken, async (req, res) => {
  try {
    const { parkId, pageIndex = 1, pageSize = 100, compareRule } = req.query;
    
    if (!parkId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：parkId'
      });
    }

    const result = await jieLinkApiService.getPersonList(
      parkId, 
      parseInt(pageIndex), 
      parseInt(pageSize), 
      compareRule
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 新增人员
router.post('/person', authenticateToken, async (req, res) => {
  try {
    const { parkId, personName, mobile, remark } = req.body;
    
    if (!parkId || !personName || !mobile) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：parkId, personName, mobile'
      });
    }

    const result = await jieLinkApiService.addPerson(parkId, { personName, mobile, remark });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 删除人员
router.delete('/person/:personId', authenticateToken, async (req, res) => {
  try {
    const { parkId } = req.query;
    const { personId } = req.params;
    
    if (!parkId || !personId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：parkId, personId'
      });
    }

    const result = await jieLinkApiService.deletePerson(parkId, personId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取场内记录
router.get('/park/records', authenticateToken, async (req, res) => {
  try {
    const { parkId, startTime, endTime, pageIndex = 1, pageSize = 100 } = req.query;
    
    if (!parkId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：parkId, startTime, endTime'
      });
    }

    const result = await jieLinkApiService.getInParkingRecords(
      parkId, 
      startTime, 
      endTime, 
      parseInt(pageIndex), 
      parseInt(pageSize)
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 下载停车凭证
router.post('/park/credential', authenticateToken, async (req, res) => {
  try {
    const { parkId, requestData } = req.body;
    
    if (!parkId || !requestData) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：parkId, requestData'
      });
    }

    const result = await jieLinkApiService.downloadParkCredential(parkId, requestData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取凭证列表（通过车牌号查询）
router.get('/voucher/list', authenticateToken, async (req, res) => {
  try {
    const { parkId, voucherNo, pageIndex = 1, pageSize = 100 } = req.query;
    
    if (!parkId || !voucherNo) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：parkId, voucherNo'
      });
    }

    const result = await jieLinkApiService.getVoucherList(
      parkId, 
      voucherNo,
      parseInt(pageIndex), 
      parseInt(pageSize)
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取设备通道
router.get('/device/access-points', authenticateToken, async (req, res) => {
  try {
    const { parkId } = req.query;
    
    if (!parkId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：parkId'
      });
    }

    const result = await jieLinkApiService.getDeviceAccessPoints(parkId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 通用POST请求转发
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { parkId, url, data } = req.body;
    
    if (!parkId || !url) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：parkId, url'
      });
    }

    // 如果请求数据中包含 pageSize，根据园区版本进行调整
    let processedData = data;
    if (data && typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.pageSize) {
          const maxPageSize = jieLinkApiService.getMaxPageSize(parkId, 100);
          parsedData.pageSize = Math.min(parsedData.pageSize, maxPageSize);
          processedData = JSON.stringify(parsedData);
          console.log(`通用请求 - parkId: ${parkId}, url: ${url}, 调整后 pageSize: ${parsedData.pageSize}`);
        }
      } catch (e) {
        // 如果解析失败，保持原数据不变
      }
    }

    const result = await jieLinkApiService.post(parkId, url, processedData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取园区缓存数据
router.get('/parks/cache', authenticateToken, async (req, res) => {
  try {
    const parkId = req.query?.parkId || null;
    
    if (parkId) {
      const cache = await ParkCacheService.getCacheByParkId(parkId);
      return res.json({
        success: true,
        data: cache
      });
    }
    
    const caches = await ParkCacheService.getAllCaches();
    res.json({
      success: true,
      data: caches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 手动触发园区缓存同步
router.post('/parks/sync', authenticateToken, async (req, res) => {
  try {
    const parkId = req.body?.parkId || null;
    
    if (parkId) {
      const result = await ParkCacheService.syncParkData(parkId);
      return res.json(result);
    }
    
    const result = await ParkCacheService.syncAllParks();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
