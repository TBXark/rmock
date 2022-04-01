import minimist from "minimist";

const args = minimist(process.argv.slice(2));
const target = args.target ? new URL(args.target) : null;

export const SERVER_PORT = args.port || 3000;

// 打印请求头
export const SHOW_REQUEST_HEADER = false;
// 打印请求体
export const SHOW_REQUEST_BODY = true;
// 打印响应体
export const SHOW_RESPONSE_BODY = true;
// 响应体JSON格式化输出
export const PRINT_RESPONSE_JSON_PRETTY = false;
// 转发请求的目标地址
export const TARGET_HOST = target?.hostname || "api.github.com";
// 是否为HTTPS
export const TARGET_IS_HTTPS = target?.protocol ? target.protocol.startsWith("https") : true;
// 目标端口
export const TARGET_PORT = target?.port || (TARGET_IS_HTTPS ? 443 : 80);
// 是否默认抓包
export const CAPUTRE_ALL_REQUEST = args.capture === "all";