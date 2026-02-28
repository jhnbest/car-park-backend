const dm = require('dmdb');
require('dotenv').config();

const createConnection = async () => {
  try {
    const connectionConfig = {
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}`,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectTimeout: 10000,
    };

    const connection = await dm.getConnection(connectionConfig);

    if (process.env.DB_NAME) {
      await connection.execute(`SET SCHEMA ${process.env.DB_NAME}`);
    }

    return connection;
  } catch (error) {
    console.error('达梦数据库连接失败:', error.message);
    throw error;
  }
};

const createPool = async () => {
  try {
    const poolConfig = {
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}`,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
      poolTimeout: 60
    };

    const pool = await dm.createPool(poolConfig);

    return pool;
  } catch (error) {
    console.error('达梦数据库连接池创建失败:', error.message);
    throw error;
  }
};

const getConnectionFromPool = async (pool) => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('从连接池获取连接失败:', error.message);
    throw error;
  }
};

const executeQuery = async (connection, sql, params = []) => {
  try {
    const result = await connection.execute(sql, params);

    if (result.rows) {
      if (result.rows.length > 0 && Array.isArray(result.rows[0])) {
        const rowsAsObjects = result.rows.map(rowArray => {
          const rowObj = {};
          if (result.metaData && Array.isArray(result.metaData)) {
            result.metaData.forEach((meta, index) => {
              if (meta && meta.name) {
                let value = rowArray[index];
                if (typeof value === 'bigint') {
                  value = Number(value);
                } else if (value && typeof value === 'object' && value.type === 2017) {
                  value = value.data || '';
                }
                rowObj[meta.name.toLowerCase()] = value;
              } else {
                let value = rowArray[index];
                if (typeof value === 'bigint') {
                  value = Number(value);
                }
                rowObj[`column_${index}`] = value;
              }
            });
          } else {
            rowArray.forEach((value, index) => {
              if (typeof value === 'bigint') {
                value = Number(value);
              }
              rowObj[`column_${index}`] = value;
            });
          }
          return rowObj;
        });
        return rowsAsObjects;
      }
      return result.rows;
    }

    return result;
  } catch (error) {
    console.error('SQL执行错误:', error.message);
    throw error;
  }
};

const closeConnection = async (connection) => {
  try {
    if (connection) {
      await connection.close();
    }
  } catch (error) {
    console.error('关闭数据库连接失败:', error.message);
  }
};

const closePool = async (pool) => {
  try {
    if (pool) {
      await pool.close();
    }
  } catch (error) {
    console.error('关闭连接池失败:', error.message);
  }
};

const testConnection = async () => {
  try {
    const connection = await createConnection();
    const result = await executeQuery(connection, 'SELECT 1 as test FROM DUAL');
    await closeConnection(connection);
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error.message);
    return false;
  }
};

module.exports = {
  createConnection,
  createPool,
  getConnectionFromPool,
  executeQuery,
  closeConnection,
  closePool,
  testConnection
};
