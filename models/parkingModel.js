const BaseModel = require('./baseModel');

/**
 * 停车场业务模型 - 处理停车场相关的业务逻辑
 */
class ParkingModel extends BaseModel {
  /**
   * 获取所有停车场数据
   * @returns {Promise} 停车场数据
   */
  static async getAllParkingData() {
    return this.getAll('car_park');
  }

  /**
   * 根据ID获取停车场信息
   * @param {number} id - 停车场ID
   * @returns {Promise} 停车场信息
   */
  static async getParkingById(id) {
    return this.getById('car_park', id);
  }

  /**
   * 添加停车场
   * @param {Object} data - 停车场数据
   * @returns {Promise} 添加结果
   */
  static async addParking(data) {
    return this.insert('car_park', data);
  }

  /**
   * 更新停车场信息
   * @param {number} id - 停车场ID
   * @param {Object} data - 更新数据
   * @returns {Promise} 更新结果
   */
  static async updateParking(id, data) {
    return this.update('car_park', id, data);
  }

  /**
   * 删除停车场
   * @param {number} id - 停车场ID
   * @returns {Promise} 删除结果
   */
  static async deleteParking(id) {
    return this.delete('car_park', id);
  }

  /**
   * 根据位置查询停车场
   * @param {string} location - 位置
   * @returns {Promise} 查询结果
   */
  static async findByLocation(location) {
    return this.findByConditions('car_park', { location });
  }

  /**
   * 分页查询停车场
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @returns {Promise} 分页结果
   */
  static async getParkingPaginated(page = 1, limit = 10) {
    return this.paginate('car_park', page, limit, 'name', 'ASC');
  }

  /**
   * 统计停车场数量
   * @returns {Promise} 停车场数量
   */
  static async countParking() {
    return this.count('car_park');
  }
}

module.exports = ParkingModel;