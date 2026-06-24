const soap = require('soap');
const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const BpmSoapService = require('./bpmSoapService');

/**
 * BPM业务系统SOAP服务端
 * 暴露业务系统接口供BPM调用
 * WSDL地址: http://<host>:<port>/bpm/soap?wsdl
 * 命名空间: http://cldz.xiamenair.com.cn/bpm
 */
class BpmSoapServer {
  /**
   * 启动SOAP服务端
   * @param {number} port - 监听端口（默认20001）
   * @returns {Promise<http.Server>} HTTP服务器实例
   */
  static async start(port = 20001) {
    const wsdlPath = path.join(__dirname, 'bpmSoapService.wsdl');
    const wsdl = fs.readFileSync(wsdlPath, 'utf8');

    // 构建SOAP服务实现
    const service = {
      BpmBusinessSystemService: {
        BpmBusinessSystemServicePort: {
          getTemplateFormList: async (args, callback, headers, req) => {
            await BpmSoapServer.handleWithCallback(args, callback, async () => {
              const { sysId, language } = BpmSoapServer.extractArgs(args);
              const result = await BpmSoapService.getTemplateFormList(sysId, language);
              return { result };
            });
          },

          getFormFieldList: async (args, callback, headers, req) => {
            await BpmSoapServer.handleWithCallback(args, callback, async () => {
              const { sysId, modelId, templateFormId, language } = BpmSoapServer.extractArgs(args);
              const result = await BpmSoapService.getFormFieldList(sysId, modelId, templateFormId, language);
              return { result };
            });
          },

          getFormFieldValueList: async (args, callback, headers, req) => {
            await BpmSoapServer.handleWithCallback(args, callback, async () => {
              const { sysId, modelId, templateFormId, formInstanceId, fieldIds, language } = BpmSoapServer.extractArgs(args);
              const result = await BpmSoapService.getFormFieldValueList(
                sysId, modelId, templateFormId, formInstanceId, fieldIds, language
              );
              return { result };
            });
          },

          getMethodInfo: async (args, callback, headers, req) => {
            await BpmSoapServer.handleWithCallback(args, callback, async () => {
              const { sysId, modelId, templateFormId, language } = BpmSoapServer.extractArgs(args);
              const result = await BpmSoapService.getMethodInfo(sysId, modelId, templateFormId, language);
              return { result };
            });
          },

          doMethodProcess: async (args, callback, headers, req) => {
            await BpmSoapServer.handleWithCallback(args, callback, async () => {
              const { formId, functionId, processData, language } = BpmSoapServer.extractArgs(args);
              const result = await BpmSoapService.doMethodProcess({
                formId, functionId, processData, language
              });
              return { result };
            });
          },

          getBusinessOrg: async (args, callback, headers, req) => {
            await BpmSoapServer.handleWithCallback(args, callback, async () => {
              const { sysId, modelId, templateFormId, formInstanceId, nodeId, nodeName, language } = BpmSoapServer.extractArgs(args);
              const result = await BpmSoapService.getBusinessOrg(
                sysId, modelId, templateFormId, formInstanceId, nodeId, nodeName, language
              );
              return { result };
            });
          },

          synchronizeTemplate: async (args, callback, headers, req) => {
            await BpmSoapServer.handleWithCallback(args, callback, async () => {
              const { sysId, flowDefinitionId, flowTemplateId, operationType, language } = BpmSoapServer.extractArgs(args);
              const result = await BpmSoapService.synchronizeTemplate(
                sysId, flowDefinitionId, flowTemplateId, operationType, language
              );
              return { result };
            });
          }
        }
      }
    };

    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const reqUrl = url.parse(req.url);
        console.log(`[SOAP服务端] 收到请求: ${req.method} ${reqUrl.pathname}`);

        if (reqUrl.pathname === '/bpm/soap' || reqUrl.pathname === '/bpm/soap/') {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
            <body>
              <h1>BPM Business System SOAP Service</h1>
              <p>WSDL: <a href="?wsdl">?wsdl</a></p>
              <p>命名空间: http://cldz.xiamenair.com.cn/bpm</p>
            </body>
            </html>
          `);
          return;
        }

        // 如果不是SOAP请求，返回404
        res.writeHead(404);
        res.end('Not Found');
      });

      server.listen(port, () => {
        const wsdlUrl = `http://localhost:${port}/bpm/soap?wsdl`;
        console.log(`[SOAP服务端] 已启动，监听端口: ${port}`);
        console.log(`[SOAP服务端] WSDL地址: ${wsdlUrl}`);
        console.log(`[SOAP服务端] 命名空间: http://cldz.xiamenair.com.cn/bpm`);

        // 使用 soap 包绑定SOAP服务
        try {
          soap.listen(server, '/bpm/soap', service, wsdl);
          console.log('[SOAP服务端] SOAP服务已绑定');
        } catch (e) {
          console.error('[SOAP服务端] SOAP绑定失败:', e.message);
        }

        resolve(server);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[SOAP服务端] 端口 ${port} 已被占用，尝试端口 ${port + 1}`);
          server.close();
          BpmSoapServer.start(port + 1).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * 从SOAP请求参数中提取实际参数
   * strong-soap 将请求参数包装在 parameters 对象中，需要解包
   * @param {Object} args - SOAP请求参数
   * @returns {Object} 解包后的参数
   */
  static extractArgs(args) {
    if (!args) return {};

    // strong-soap 可能将参数包装在 parameters 中
    const params = args.parameters || args;

    // 如果是数组格式 [value1, value2, ...]
    if (Array.isArray(params)) {
      return {};
    }

    return params;
  }

  /**
   * 统一处理 SOAP 方法回调
   * @param {Object} args - 请求参数
   * @param {Function} callback - SOAP 回调函数
   * @param {Function} handler - 业务逻辑处理函数
   */
  static async handleWithCallback(args, callback, handler) {
    try {
      console.log(`[SOAP服务端] 请求参数:`, JSON.stringify(args));
      const result = await handler();
      console.log(`[SOAP服务端] 响应:`, JSON.stringify(result).substring(0, 200));
      callback(null, result);
    } catch (error) {
      console.error('[SOAP服务端] 处理请求失败:', error.message);
      // BPM 期望的错误返回格式
      const errorResult = { result: `F：${error.message}` };
      callback(null, errorResult);
    }
  }
}

module.exports = BpmSoapServer;
