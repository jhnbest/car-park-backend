const { verifyToken, extractToken } = require('../utils/jwtUtils');

/**
 * JWT认证中间件
 * 验证请求头中的Bearer令牌
 */
const authenticateToken = async (req, res, next) => {
  try {
    const token = extractToken(req);
    const decoded = verifyToken(token);
    
    // 将用户信息添加到请求对象中
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || '认证失败'
    });
  }
};

/**
 * 可选认证中间件
 * 不强制要求认证，但如果有令牌会验证并添加用户信息
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch (error) {
    // 忽略认证错误，继续执行
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};