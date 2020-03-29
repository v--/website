import { router } from '../../common/router.js'
import { RouterState } from '../../common/support/router_state.js'

export async function clientRouter (path, api) {
  try {
    return await router(path, api)
  } catch (e) {
    console.error(e)
    return RouterState.error(path, e)
  }
}
