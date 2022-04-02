import { Command } from "commander";

const program = new Command();
program
  .option("-p, --port <number>", "Port to listen on", "3000")
  .option("-t, --target <url>", "target url", "https://example.com")
  .option("-tp, --targetPort <number>", "target port", null)
  .option("-c, --capture <all|none>", "capture all request or none", "all")
  .option("-r, --router <path>", "external router file", null)
  .option("-rh, --requestHeader", "show request header", false)
  .option("-rb, --requestBody", "show request body", true)
  .option("-res, --responseBody", "show response body", true)
  .option("-pj, --prettyJson", "print response json pretty", false)
  .helpOption("--help", "read more information")
  .parse(process.argv);

const options = program.opts();
const target = new URL(options.target);

function stringToNumber(str, defaultValue) {
  const num = parseInt(str, 10);
  if (isNaN(num)) {
    return defaultValue;
  }
  return num;
}

// 服务器端口
export const SERVER_PORT = stringToNumber(options.port, 3000);
// 打印请求头
export const SHOW_REQUEST_HEADER = options.requestHeader;
// 打印请求体
export const SHOW_REQUEST_BODY = options.requestBody;
// 打印响应体
export const SHOW_RESPONSE_BODY = options.responseBody;
// 响应体JSON格式化输出
export const PRINT_RESPONSE_JSON_PRETTY = options.prettyJson;
// 转发请求的目标地址
export const TARGET_HOST = target.hostname;
// 是否为HTTPS
export const TARGET_IS_HTTPS = target.protocol.startsWith("https");
// 目标端口
export const TARGET_PORT = stringToNumber(options.targetPort) || (TARGET_IS_HTTPS ? 443 : 80);
// 是否默认抓包
export const CAPUTRE_ALL_REQUEST = options.capture === "all";
// 外部路由注册
export const DYNAMIC_ROUTER_PATH = options.router;
