# response-mapper

Modify the http response (only json is supported), no need for http capture and Mithm.

### Example

Edit `router.js`

```js
router.get( "/users/:name", mapBody((res, ctx) => {
    const { params, query } = ctx;
    console.log(params);
    return {
      ...res,
      login: `Inject: ${res.login}`
    };
  })
);

```