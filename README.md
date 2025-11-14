# rmock

Modern HTTP mock proxy that lets you rewrite JSON responses without installing browser plugins or intercepting traffic. Built with TypeScript, hot-reloadable routers, and first-class ESM support.

### Install

```shell
npm install -g rmock
```

### Usage

```
Usage: rmock [options]

Options:
  -p, --port <port>           port (default: 3000)
  -t, --target <url>          target url (default: "https://api.github.com")
  -P, --target-port <port>    target port override
  -c, --capture <all|none>    capture all request or none (default: "all")
  -r, --router <path>         external router file (ESM or CJS)
  -H, --request-header        show request header (default: false)
  -B, --request-body          show request body (default: true)
  -R, --response-body         show response body (default: true)
  -J, --pretty-json           print response json pretty (default: false)
      --no-router-watch       disable router hot reload
  -h, --help                  read more information
  -v, --version               show version number
```


### Example

```js
// example.js
export async function register(router, utils, importModule) {
  const { mapJSON } = utils
  const { fetch } = await importModule('undici')

  router.get('/', mapJSON(null, { canLog: false }))

  router.get('/status', mapJSON(responseBody => ({
    ...responseBody,
    inject: 'Hello World!!!',
  })))

  router.get('/users/:id', mapJSON(async (responseBody, ctx) => {
    const { id } = ctx.params
    const repos = await fetch(`https://api.github.com/users/${id}/repos`).then(res => res.json())
    return {
      ...responseBody,
      repos,
    }
  }))
}
```


```shell
rmock -p 3000 -t https://api.github.com -c all -r example.js
```
