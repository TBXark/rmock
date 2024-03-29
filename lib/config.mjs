import {Command, Option} from 'commander';

const program = new Command();

program
    .addOption(new Option('-p, --port <port>', 'port').argParser((v) => parseInt(v, 10)).default(3000)) // eslint-disable-line max-len
    .option('-t, --target <url>', 'target url', 'https://api.github.com')
    .addOption(new Option('-tp, --targetPort <port>', 'target port').argParser((v) => parseInt(v, 10))) // eslint-disable-line max-len
    .option('-c, --capture <all|none>', 'capture all request or none', 'all')
    .option('-r, --router <path>', 'external router file', null)
    .option('-rh, --requestHeader', 'show request header', false)
    .option('-rb, --requestBody', 'show request body', true)
    .option('-res, --responseBody', 'show response body', true)
    .option('-pj, --prettyJson', 'print response json pretty', false)
    .option('-v, --version', 'output the version number', false)
    .helpOption('-h --help', 'read more information')
    .parse(process.argv);

const options = program.opts();
const target = new URL(options.target);


// 服务器端口
export const SERVER_PORT = options.port;
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
export const TARGET_IS_HTTPS = target.protocol.startsWith('https');
// 目标端口
export const TARGET_PORT = options.targetPort || (TARGET_IS_HTTPS ? 443 : 80);
// 是否默认抓包
export const CAPTURE_ALL_REQUEST = options.capture === 'all';
// 外部路由注册
export const DYNAMIC_ROUTER_PATH = options.router;
// 显示版本号
export const SHOW_VERSION = options.version;
