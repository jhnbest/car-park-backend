const PersonModel = require('../models/personModel');

/**
 * 人员数据服务 - 处理人员数据的业务逻辑
 */
class PersonService {
  /**
   * 分页获取人员数据
   * @param {number} page - 页码
   * @param {number} pageSize - 每页大小
   * @param {Object} filters - 筛选条件
   * @returns {Promise} 人员数据
   */
  async getPersons(page = 1, pageSize = 20, filters = {}) {
    try {
      const result = await PersonModel.getPaginatedData(page, pageSize, filters);
      
      return {
        success: true,
        data: result.data,
        pagination: {
          page,
          pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / pageSize)
        },
        message: '获取人员数据成功'
      };
    } catch (error) {
      console.error('获取人员数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 根据ID获取人员详情
   * @param {string} personId - 人员ID
   * @returns {Promise} 人员详情
   */
  async getPersonById(personId) {
    try {
      const person = await PersonModel.findById(personId);
      if (!person) {
        throw new Error('人员不存在');
      }

      return {
        success: true,
        data: person,
        message: '获取人员详情成功'
      };
    } catch (error) {
      console.error('获取人员详情失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取人员统计数据
   * @returns {Promise} 统计信息
   */
  async getPersonStatistics() {
    try {
      const totalPersons = await PersonModel.getCount();
      const statistics = await PersonModel.getStatistics();

      return {
        success: true,
        data: {
          totalPersons,
          statistics
        },
        message: '获取人员统计数据成功'
      };
    } catch (error) {
      console.error('获取人员统计数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 搜索人员数据
   * @param {string} keyword - 搜索关键词
   * @param {number} page - 页码
   * @param {number} pageSize - 每页大小
   * @returns {Promise} 搜索结果
   */
  async searchPersons(keyword, page = 1, pageSize = 20) {
    try {
      const result = await PersonModel.search(keyword, page, pageSize);

      return {
        success: true,
        data: result.data,
        pagination: {
          page,
          pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / pageSize)
        },
        message: '搜索人员数据成功'
      };
    } catch (error) {
      console.error('搜索人员数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取人员筛选选项
   * @returns {Promise} 筛选选项数据
   */
  async getPersonFilters() {
    try {
      const [organIds, empTypes] = await Promise.all([
        PersonModel.getOrganIds(),
        PersonModel.getEmpTypes()
      ]);

      return {
        success: true,
        data: {
          organIds,
          empTypes
        },
        message: '获取筛选选项成功'
      };
    } catch (error) {
      console.error('获取筛选选项失败:', error.message);
      throw error;
    }
  }

  /**
   * 根据人员姓名模糊搜索人员列表
   * @param {string} name - 人员姓名
   * @returns {Promise} 人员列表
   */
  async getPersonByName(name) {
    try {
      const persons = await PersonModel.findByName(name);
      
      // 如果没有找到匹配的人员，正常返回空的人员名单
      if (!persons || persons.length === 0) {
        return {
          success: true,
          data: [],
          message: '未找到匹配的人员'
        };
      }

      return {
        success: true,
        data: persons,
        message: `找到 ${persons.length} 个匹配的人员`
      };
    } catch (error) {
      console.error('根据姓名搜索人员失败:', error.message);
      throw error;
    }
  }

  /**
   * 根据人员工号获取人员详情
   * @param {string} mfId - 人员工号
   * @returns {Promise} 人员详情
   */
  async getPersonByMfId(mfId) {
    try {
      const person = await PersonModel.findById(mfId);
      
      // 如果没有找到匹配的人员，正常返回空结果
      if (!person) {
        return {
          success: true,
          data: null,
          message: '未找到匹配的人员'
        };
      }

      return {
        success: true,
        data: person,
        message: '获取人员详情成功'
      };
    } catch (error) {
      console.error('根据工号获取人员详情失败:', error.message);
      throw error;
    }
  }
}

module.exports = PersonService;