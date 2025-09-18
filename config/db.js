const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * 创建数据库连接池
 * 用于需要连接池的场景
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * 创建单个数据库连接
 * 用于不需要连接池的场景
 * @returns {Promise} 数据库连接对象
 */
const createConnection = async () => {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
};

// 同时导出连接池和创建连接函数
module.exports = {
  pool,
  createConnection
};