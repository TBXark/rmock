import {createRequire} from 'module';
import path from 'path';
import os from 'os';
import fs from 'fs';
import vm from 'vm';

export function dynamicImportCjs(uri) {
  const require = createRequire(import.meta.url);
  const modulePath = path.resolve(uri);
  try {
    delete require.cache[modulePath];
  } catch (error) {
    // ignore
  }
  return require(modulePath);
}

export async function dynamicImportWithTempFile(uri) {
  const raw = fs.readFileSync(uri, 'utf8');
  const fileName = `temp-import-${new Date().getTime()}.js`;
  const filePath = path.join(os.tmpdir(), fileName);
  fs.writeFileSync(filePath, raw);
  const module = await import(filePath);
  fs.unlinkSync(filePath);
  return module;
}

export async function dynamicImportWithVM(uri, sandbox, ...modules) {
  const vmContext = vm.createContext(sandbox);
  try {
    const raw = fs.readFileSync(uri, 'utf8');
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
