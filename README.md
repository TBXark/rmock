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
  -p, --port <number>         Port to listen on (default: "3000")
  -t, --target <url>          target url (default: "https://api.github.com")
  -tp, --targetPort <number>  target port (default: null)
  -c, --capture <all|none>    capture all request or none (default: "all")
  -r, --router <path>         external router file (default: null)
  -rh, --requestHeader        show request header (default: false)
  -rb, --requestBody          show request body (default: true)
  -res, --responseBody        show response body (default: true)
  -pj, --prettyJson           print response json pretty (default: false)
  -i, --importer              import external code mode: vm,esm,cjs
  --help                      read more information
```


### Example

```js
// example.js
// sandbox: fs, fetch, path, log 
//
function register(router, utils) {
    const { mapJSON, customMapper, redirect } = utils;
    
    // 1. disable some api log
    router.get('/', mapJSON(null, { canLog: false }))
    
    // 2. change response body
    router.get('/status', mapJSON((res, ctx) => {
      return {
        ...res,
        inject: 'Hello World???'
      };
    }))

    // 3. async mapper
    router.get('/users/:id', mapJSON(async (res, ctx) => {
      const { id } = ctx.params;
      const repos = await fetch(`https://api.github.com/users/${id}/repos`).then(res => res.json());
      return {
        ...res,
        repos
      };
    }))
}

// add in esm mode
module.register = register;
// add in cjs mode
exports.register = register;
```


```shell
rmock -p 3000 -t https://api.github.com -c all -r example.js
```
