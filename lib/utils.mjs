import fs from "fs";
import vm from "vm";

/*
// dynamicImport by `Function(...)`
function dynamicImport(path, ...modules) {
  let resObj = {}
  console.log(`import { ${modules.join(", ")} } from ${path}`);
  try {
    const raw = fs.readFileSync(path, "utf8");
    const imp =  modules.map(m => {
      return `
      if (typeof ${m} !== 'undefined') {
        _____resObj["${m}"] = ${m}
      } 
      `
    }).join("\n")
    const importer = new Function(`
        const _____resObj = {}
        try {
          ${raw}
          ${imp}
        } catch (error) {
        }
        return _____resObj;
    `);
    resObj = importer();
  } catch (error) {
    console.log("dynamic import error", error);
  }
  return resObj
}
*/
export function dynamicImport(path, sandbox, ...modules) {
    console.log(`import { ${modules.join(", ")} } from ${path}`);
    const vmContext = vm.createContext(sandbox);
    try {
        const raw = fs.readFileSync(path, "utf8");
        vm.runInContext(raw, vmContext);
    } catch (error) {
        console.log("dynamic import error", error);
    }
    return modules.reduce((resObj, m) => {
        if (typeof vmContext[m] !== "undefined") {
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
