require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 基础中间件
app.use(cors());
app.use(express.json());

// 导入路由
const baseRoutes = require('./routes/baseRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api', baseRoutes);
app.use('/api/auth', authRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});