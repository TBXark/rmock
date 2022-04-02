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
  --help                      read more information
```


### Example

```js
// example.js
function register(router, utils) {
    const { mapJSON, mapResponse, redirect } = utils;
    router.get('/status', mapJSON((res, ctx) => {
      return {
        ...res,
        inject: 'Hello World???'
      };
    }))
}
```


```shell
rmock -p 3000 -t https://api.github.com -c all -r example.js
```