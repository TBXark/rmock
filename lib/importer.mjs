
export async function dynamicImportCjs(uri) {
  const {createRequire} = import('module');
  const path = await import('path');

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
  const os = await import('os');
  const path = await import('path');
  const fs = await import('fs');

  const raw = fs.readFileSync(uri, 'utf8');
  const fileName = `temp-import-${new Date().getTime()}.js`;
  const filePath = path.join(os.tmpdir(), fileName);
  fs.writeFileSync(filePath, raw);
  const module = await import(filePath);
  fs.unlinkSync(filePath);
  return module;
}

export async function dynamicImportWithVM(uri, sandbox, ...modules) {
  const vm = await import('vm');
  const fs = await import('fs');

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
