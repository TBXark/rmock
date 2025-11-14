export async function register(router, utils, importModule) {
  const { mapJSON } = utils

  const { fetch } = await importModule('undici')

  router.get('/', mapJSON(null, { canLog: false }))

  router.get('/status', mapJSON(res => ({
    ...res,
    inject: 'Hello World!!!',
  })))

  router.get('/users/:id', mapJSON(async (res, ctx) => {
    const { id } = ctx.params
    const repos = await fetch(`https://api.github.com/users/${id}/repos`).then(response => response.json())
    return {
      ...res,
      repos,
    }
  }))
}
