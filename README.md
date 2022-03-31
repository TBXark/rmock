# response-mapper

Modify the http json response, no need for http capture and MitM.

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
