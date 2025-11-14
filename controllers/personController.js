const PersonService = require('../services/personService');

class PersonController {
  static personService = new PersonService();
  /**
   * 分页获取人员数据
   */
  static async getPersons(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      
      const filters = {};
      if (req.query.cn_name) filters.cn_name = req.query.cn_name;
      if (req.query.mf_id) filters.mf_id = req.query.mf_id;
      if (req.query.organ_id) filters.organ_id = req.query.organ_id;
      if (req.query.emp_type) filters.emp_type = req.query.emp_type;
      if (req.query.gender) filters.gender = req.query.gender;
      
      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: '页码必须大于等于1'
        });
      }
      
      if (pageSize < 1 || pageSize > 100) {
        return res.status(400).json({
          success: false,
          message: '每页数量必须在1-100之间'
        });
      }
      
      const result = await PersonController.personService.getPersons(page, pageSize, filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('获取人员数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取人员数据失败: ' + error.message
      });
    }
  }

  /**
   * 获取人员详情
   */
  static async getPersonDetail(req, res) {
    try {
      const { empSid } = req.params;
      
      if (!empSid) {
        return res.status(400).json({
          success: false,
          message: '人员ID不能为空'
        });
      }
      
      const result = await PersonController.personService.getPersonById(empSid);
      
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('获取人员详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取人员详情失败: ' + error.message
      });
    }
  }

  /**
   * 获取人员筛选选项
   */
  static async getPersonFilters(req, res) {
    try {
      const result = await PersonController.personService.getPersonFilters();
      
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('获取筛选选项失败:', error);
      res.status(500).json({
        success: false,
        message: '获取筛选选项失败: ' + error.message
      });
    }
  }

  /**
   * 根据人员姓名获取人员详情
   */
  static async getPersonByName(req, res) {
    
    try {
      // 支持多种参数获取方式
      // 1. 首先尝试嵌套参数格式 params[name]
      // 2. 然后尝试直接参数格式 name
      let name = req.query['params[name]'] || req.query.name;

      console.log('最终获取到的姓名参数:', name);
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: '人员姓名不能为空'
        });
      }
      
      const result = await PersonController.personService.getPersonByName(name);
      
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('根据姓名获取人员详情失败:', error);
      res.status(500).json({
        success: false,
        message: '根据姓名获取人员详情失败: ' + error.message
      });
    }
  }

  /**
   * 根据人员工号获取人员详情
   */
  static async getPersonByMfId(req, res) {
    console.log('=== 根据工号获取人员详情调试信息 ===');
    console.log('完整的 req.query:', req.query);
    console.log('请求方法:', req.method);
    console.log('请求URL:', req.url);
    
    try {
      // 支持多种参数获取方式
      // 1. 首先尝试嵌套参数格式 params[mfId]
      // 2. 然后尝试直接参数格式 mfId
      let mfId = req.query['params[mfId]'] || req.query.mfId;

      console.log('最终获取到的工号参数:', mfId);
      
      if (!mfId) {
        return res.status(400).json({
          success: false,
          message: '人员工号不能为空'
        });
      }
      
      const result = await PersonController.personService.getPersonByMfId(mfId);
      
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('根据工号获取人员详情失败:', error);
      res.status(500).json({
        success: false,
        message: '根据工号获取人员详情失败: ' + error.message
      });
    }
  }
}

module.exports = PersonController;