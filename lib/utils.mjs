import fs from 'fs';
import vm from 'vm';

export function dynamicImport(path, sandbox, ...modules) {
  console.log(`import { ${modules.join(', ')} } from ${path}`);
  const vmContext = vm.createContext(sandbox);
  try {
    const raw = fs.readFileSync(path, 'utf8');
    vm.runInContext(raw, vmContext);
  } catch (error) {
    console.log('dynamic import error', error);
  }
  return modules.reduce((resObj, m) => {
    if (typeof vmContext[m] !== 'undefined') {
      resObj[m] = vmContext[m];
    }
    return resObj;
  }, {});
}

export function stringToNumber(str, defaultValue) {
  const num = parseInt(str, 10);
  if (isNaN(num)) {
    return defaultValue;
  }
  return num;
}
