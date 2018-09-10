import router from '../../common/router.mjs'
import RouterState from '../../common/support/router_state.mjs'

export default async function clientRouter (path, api) {
  try {
    return await router(path, api)
  } catch (e) {
    return RouterState.error(path, e)
  }
}
