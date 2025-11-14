const express = require('express');
const router = express.Router();

// 导入各个业务模块的路由
const authRoutes = require('./authRoutes');
const parkingRoutes = require('./parkingRoutes');
const personRoutes = require('./personRoutes');
const systemRoutes = require('./systemRoutes');
const syncRoutes = require('./syncRoutes');

/**
 * API路由聚合器
 * 将各个业务模块的路由聚合到统一的API前缀下
 */

// 认证相关路由 - /api/auth/*
router.use('/auth', authRoutes);

// 停车场数据相关路由 - /api/parking/*
router.use('/parking', parkingRoutes);

// 人员数据相关路由 - /api/persons/*
router.use('/persons', personRoutes);

// 系统管理相关路由 - /api/system/*
router.use('/system', systemRoutes);

// 数据同步相关路由 - /api/sync/*
router.use('/sync', syncRoutes);

module.exports = router;