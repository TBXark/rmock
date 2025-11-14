import pc from 'picocolors';

export interface RequestLog {
  status: number;
  statusText: string;
  method: string;
  url: string;
  header?: unknown;
  body?: unknown;
  response?: unknown;
  map?: unknown;
}

function statusColor(status: number) {
  if (status >= 200 && status < 300) {
    return pc.green;
  }
  if (status >= 300 && status < 400) {
    return pc.yellow;
  }
  if (status >= 400 && status < 500) {
    return pc.cyan;
  }
  return pc.red;
}

function summary(status: number, method: string, statusText: string, url: string) {
  const colorize = statusColor(status);
  const methodLabel = colorize(`${method} [${status} ${statusText}]`);
  return `${methodLabel} : ${pc.bold(url)}\n`;
}

function request(log: RequestLog) {
  console.group(summary(log.status, log.method, log.statusText, log.url));
  if (log.header) {
    console.log('\n--Request Header---------------------------\n');
    console.log(log.header);
  }
  if (log.body) {
    console.log('\n--Request Body-----------------------------\n');
    console.log(log.body);
  }
  if (log.response) {
    console.log('\n--Response Body----------------------------\n');
    console.log(log.response);
  }
  if (log.map) {
    console.log('\n--Map Response Body------------------------\n');
    console.log(log.map);
  }
  console.log('\n--End--------------------------------------\n\n');
  console.groupEnd();
}

const logger = {
  summary,
  request,
};

export default logger;
