import router from '../../common/router.js'
import RouterState from '../../common/support/router_state.js'

export default async function clientRouter (path, api) {
  try {
    return await router(path, api)
  } catch (e) {
    return RouterState.error(path, e)
  }
}
