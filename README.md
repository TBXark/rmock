# response-mapper

Modify the http json response, no need for http capture and MitM.

### Example

Start server:

```shell
yarn run dev --target=https://example.com --capture=all --port=8080
```


Edit `router.js`

```js
router.get( "/users/:name", mapResponse((res, ctx) => {
    // const { params, query } = ctx;
    return {
      ...res,
      login: `Inject: ${res.login}`
    };
  })
);

```
