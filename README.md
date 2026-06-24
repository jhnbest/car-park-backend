# 园区停车管理系统 - 后端服务

## 项目简介

后端服务基于 Express.js 构建，提供 RESTful API 和 BPM SOAP 接口，支持园区停车权限管理、捷顺科技 JieLink 对接、服务治理中心数据同步等功能。

## 技术栈

- **运行时**：Node.js
- **框架**：Express.js 5.x
- **数据库**：达梦 DMDB（兼容 Oracle / MySQL 协议）
- **SOAP 服务**：soap (BPM 流程引擎回调接口)
- **认证**：JWT + HMAC

## 目录结构

```
car-park-backend/
├── config/               # 配置文件
├── controllers/          # 控制器层
├── middleware/           # 中间件（认证、日志审计）
├── models/              # 数据模型层
├── routes/              # 路由定义
├── services/            # 业务逻辑层
│   ├── bpmSoapServer.js # BPM SOAP 服务端
│   ├── bpmClientService.js # BPM SOAP 客户端
│   └── schedulerService.js # 定时任务服务
├── sql/                 # 数据库脚本
├── utils/               # 工具函数
└── app.js              # 应用入口
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example`（如无可手动创建）并配置以下关键项：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5236
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_db

# 服务端口
PORT=20000
SOAP_PORT=20001

# JWT 密钥
JWT_SECRET=your-secret-key

# 服务治理中心
GATEWAY_API_URL=https://sergokong-test.xiamenair.com.cn:9000
GATEWAY_HMAC_USERNAME=your_username
GATEWAY_HMAC_SECRET=your_secret
```

### 3. 启动服务

```bash
node app.js
```

服务启动后：
- REST API：`http://localhost:20000`
- SOAP 服务：`http://localhost:20001/bpm/soap?wsdl`

## 主要功能模块

### 权限申请 (PermissionApply)
- 提交园区停车权限申请
- 查询申请历史记录
- 与 BPM 流程引擎对接

### BPM SOAP 接口
- `getTemplateFormList` - 获取表单模板列表
- `doMethodProcess` - 处理业务流程方法
- `getBusinessOrg` - 获取业务组织架构

### 数据同步 (Sync)
- 从服务治理中心同步机构数据
- 从捷顺科技 JieLink 同步人员数据
- 定时任务自动同步

### 审计日志 (AuditLog)
- 记录所有敏感操作
- 接口调用日志

## 接口文档

敏感业务接口文档已通过 `.gitignore` 排除，包括：
- `BPM流程引擎对接教程.md`
- `服务治理中心认证说明.md`
- `机构数据接口文档.md`
- `人员数据接口文档.md`

## 环境要求

- Node.js >= 16.x
- 达梦数据库 / MySQL
- NPM >= 8.x
