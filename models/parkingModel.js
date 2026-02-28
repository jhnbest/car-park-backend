const BaseModel = require('./baseModel');

/**
 * 园区/停车场业务模型 - 处理园区相关的业务逻辑
 * 表名：park_info (原 car_park)
 */
class ParkingModel extends BaseModel {
  /**
   * 获取所有园区数据
   * @returns {Promise} 园区数据
   */
  static async getAllParkingData() {
    return this.getAll('park_info');
  }

  /**
   * 根据ID获取园区信息
   * @param {number} id - 园区ID
   * @returns {Promise} 园区信息
   */
  static async getParkingById(id) {
    return this.getById('park_info', id);
  }

  /**
   * 添加园区
   * @param {Object} data - 园区数据
   * @returns {Promise} 添加结果
   */
  static async addParking(data) {
    return this.insert('park_info', data);
  }

  /**
   * 更新园区信息
   * @param {number} id - 园区ID
   * @param {Object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  static async updateParking(id, data) {
    return this.update('park_info', id, data);
  }

  /**
   * 删除园区
   * @param {number} id - 园区ID
   * @returns {Promise} 删除结果
   */
  static async deleteParking(id) {
    return this.delete('park_info', id);
  }

  /**
   * 根据位置查询园区
   * @param {string} location - 位置
   * @returns {Promise} 查询结果
   */
  static async findByLocation(location) {
    return this.findByConditions('park_info', { location });
  }

  /**
   * 分页查询园区
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @returns {Promise} 分页结果
   */
  static async getParkingPaginated(page = 1, limit = 10) {
    return this.paginate('park_info', page, limit, 'park_name', 'ASC');
  }

  /**
   * 统计园区数量
   * @returns {Promise} 园区数量
   */
  static async countParking() {
    return this.count('park_info');
  }
}

module.exports = ParkingModel;
