# rmock

Modify the http json response, no need for http capture and MitM, and solutions of cross domain problems.

### Install

```shell
npm install -g https://github.com/TBXark/rmock.git
```

### Usage

```
Usage: rmock [options]

Options:
  -p, --port <port>           port (default: 3000)
  -t, --target <url>          target url (default: "https://api.github.com")
  -tp, --targetPort <number>  target port
  -c, --capture <all|none>    capture all request or none (default: "all")
  -r, --router <path>         external router file (default: null)
  -rh, --requestHeader        show request header (default: false)
  -rb, --requestBody          show request body (default: true)
  -res, --responseBody        show response body (default: true)
  -pj, --prettyJson           print response json pretty (default: false)
  -h --help                   read more information
```


### Example

```js
// example.js

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

```


```shell
rmock -p 3000 -t https://api.github.com -c all -r example.js
```
