// Import core modules using require
//
// const os = require('os');
// console.log(os.arch());

async function register(router, utils, importModule) {
  // Commonly used functions are injected by default
  //
  //
  const {mapJSON, customMapper, redirect} = utils; // eslint-disable-line

  // Import custom modules using importModule
  //
  // get default export manually
  const {default: fetch} = await importModule('node-fetch');
  
  // import internal modules
  // const log = await importModule('./log.mjs');


  // Example
  //
  //

  // 1. disable some api log
  router.get('/', mapJSON(null, {canLog: false}));

  // 2. change response body
  router.get('/status', mapJSON((res, ctx) => {
    return {
      ...res,
      inject: 'Hello World!!!',
    };
  }));

  // 3. async mapper
  router.get('/users/:id', mapJSON(async (res, ctx) => {
    const {id} = ctx.params;
    const repos = await fetch(`https://api.github.com/users/${id}/repos`).then((res) => res.json());
    return {
      ...res,
      repos,
    };
  }));
}

// use commonjs export
exports.register = register;
