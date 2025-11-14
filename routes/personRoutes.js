const express = require('express');
const router = express.Router();
const PersonController = require('../controllers/personController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * 分页获取人员数据
 * @route GET /api/persons
 * @desc 分页获取人员数据，支持筛选和排序
 * @access Private
 */
router.get('/', authenticateToken, PersonController.getPersons);

/**
 * 根据人员姓名获取人员详情
 * @route GET /api/persons/getPersonByName
 * @desc 根据人员姓名获取人员详情
 * @access Private
 */
router.get('/getPersonByName', authenticateToken, PersonController.getPersonByName);

/**
 * 根据人员工号获取人员详情
 * @route GET /api/persons/getPersonByMfId
 * @desc 根据人员工号获取人员详情
 * @access Private
 */
router.get('/getPersonByMfId', authenticateToken, PersonController.getPersonByMfId);

/**
 * 获取人员筛选选项
 * @route GET /api/persons/filters
 * @desc 获取人员数据的筛选选项（机构ID列表、人员类型列表）
 * @access Private
 */
router.get('/filters', authenticateToken, PersonController.getPersonFilters);

/**
 * 获取人员详情
 * @route GET /api/persons/:empSid
 * @desc 根据人员ID获取人员详情
 * @access Private
 */
router.get('/:empSid', authenticateToken, PersonController.getPersonDetail);


module.exports = router;