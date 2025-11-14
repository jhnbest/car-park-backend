const dm = require('dmdb');
require('dotenv').config();

/**
 * 创建达梦数据库连接
 * @returns {Promise} 达梦数据库连接对象
 */
const createConnection = async () => {
  try {
    // 达梦数据库连接配置
    const connectionConfig = {
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}`, // 主机:端口
      user: process.env.DB_USER,      // 用户名
      password: process.env.DB_PASSWORD, // 密码
      // 可选连接参数
      connectTimeout: 10000,          // 连接超时时间(毫秒)
    };

    console.log('正在连接达梦数据库...');
    console.log('连接字符串:', connectionConfig.connectString);
    console.log('用户:', connectionConfig.user);

    // 达梦数据库的正确连接方式 - 使用getConnection
    const connection = await dm.getConnection(connectionConfig);

    // 选择模式（达梦使用模式而不是数据库）
    if (process.env.DB_NAME) {
      console.log('设置数据库模式:', process.env.DB_NAME);
      await connection.execute(`SET SCHEMA ${process.env.DB_NAME}`);
    }

    console.log('达梦数据库连接成功');
    return connection;
  } catch (error) {
    console.error('达梦数据库连接失败:', error.message);
    console.error('错误详情:', error);
    throw error;
  }
};

/**
 * 创建达梦数据库连接池
 * @returns {Promise} 达梦数据库连接池对象
 */
const createPool = async () => {
  try {
    // 达梦数据库连接池配置
    const poolConfig = {
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}`,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      poolMin: 2,        // 最小连接数
      poolMax: 10,       // 最大连接数
      poolIncrement: 1,  // 连接数增长步长
      poolTimeout: 60    // 连接超时时间(秒)
    };

    console.log('正在创建达梦数据库连接池...');
    
    // 创建连接池 - 达梦使用createPool
    const pool = await dm.createPool(poolConfig);
    
    console.log('达梦数据库连接池创建成功');
    return pool;
  } catch (error) {
    console.error('达梦数据库连接池创建失败:', error.message);
    throw error;
  }
};

/**
 * 从连接池获取连接
 * @param {Object} pool - 连接池对象
 * @returns {Promise} 数据库连接
 */
const getConnectionFromPool = async (pool) => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('从连接池获取连接失败:', error.message);
    throw error;
  }
};

/**
 * 执行SQL查询
 * @param {Object} connection - 达梦连接对象
 * @param {string} sql - SQL语句
 * @param {Array} params - 查询参数
 * @returns {Promise} 查询结果
 */
const executeQuery = async (connection, sql, params = []) => {
  try {
    console.log('执行SQL:', sql);
    console.log('参数:', params);
    
    const result = await connection.execute(sql, params);
    
    // 达梦数据库返回结果处理
    if (result.rows) {
      console.log('查询结果行数:', result.rows.length);
      
      // 检查结果格式并转换为标准对象
      if (result.rows.length > 0) {
        // 如果第一行是数组（达梦默认格式），转换为对象
        if (Array.isArray(result.rows[0])) {
          console.log('检测到达梦数据库数组格式结果，正在转换为对象格式...');
          
          const rowsAsObjects = result.rows.map(rowArray => {
            const rowObj = {};
            
            // 使用元数据获取列名
            if (result.metaData && Array.isArray(result.metaData)) {
              result.metaData.forEach((meta, index) => {
                if (meta && meta.name) {
                  // 将列名转换为小写，确保一致性
                  rowObj[meta.name.toLowerCase()] = rowArray[index];
                } else {
                  rowObj[`column_${index}`] = rowArray[index];
                }
              });
            } else {
              // 如果没有元数据，使用默认字段名
              rowArray.forEach((value, index) => {
                rowObj[`column_${index}`] = value;
              });
            }
            
            return rowObj;
          });
          
          return rowsAsObjects;
        }
        
        // 如果已经是对象格式，直接返回
        if (typeof result.rows[0] === 'object' && result.rows[0] !== null) {
          console.log('结果已经是对象格式');
          return result.rows;
        }
      }
      
      return result.rows;
    }
    
    console.log('执行结果:', result);
    return result;
  } catch (error) {
    console.error('SQL执行错误:', error.message);
    console.error('SQL语句:', sql);
    console.error('参数:', params);
    throw error;
  }
};

/**
 * 关闭数据库连接
 * @param {Object} connection - 数据库连接对象
 */
const closeConnection = async (connection) => {
  try {
    if (connection) {
      await connection.close();
      console.log('数据库连接已关闭');
    }
  } catch (error) {
    console.error('关闭数据库连接失败:', error.message);
  }
};

/**
 * 关闭连接池
 * @param {Object} pool - 连接池对象
 */
const closePool = async (pool) => {
  try {
    if (pool) {
      await pool.close();
      console.log('数据库连接池已关闭');
    }
  } catch (error) {
    console.error('关闭连接池失败:', error.message);
  }
};

/**
 * 测试数据库连接
 */
const testConnection = async () => {
  try {
    const connection = await createConnection();
    
    // 执行一个简单的测试查询
    const result = await executeQuery(connection, 'SELECT 1 as test FROM DUAL');
    console.log('数据库连接测试成功:', result);
    
    await closeConnection(connection);
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error.message);
    return false;
  }
};

// 导出所有数据库操作函数
module.exports = {
  createConnection,
  createPool,
  getConnectionFromPool,
  executeQuery,
  closeConnection,
  closePool,
  testConnection
};