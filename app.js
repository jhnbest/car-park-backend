require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const SchedulerService = require('./services/schedulerService');
const SyncSchedulerService = require('./services/syncSchedulerService');
const app = express();

// 基础中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 导入路由
const apiRoutes = require('./routes/apiRoutes');

// 注册路由
app.use('/api', apiRoutes);



// 404处理
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});


// 应用启动时自动启动定时任务（可选）
const schedulerService = new SchedulerService();
const syncSchedulerService = new SyncSchedulerService();

if (process.env.AUTO_START_SCHEDULER === 'true') {
  schedulerService.startAllTasks();
}

// 启动服务治理中心数据同步定时任务（默认启用）
if (process.env.ENABLE_GATEWAY_SYNC === 'true') {
  syncSchedulerService.startAllTasks();
}

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});