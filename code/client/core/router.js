import { router } from '../../common/router.js'
import { Path } from '../../common/support/path.js'
import { RouterState } from '../../common/support/router_state.js'

/**
 * @param {Path} path
 * @param {TStore.IStore} store
 */
export async function clientRouter(path, store) {
  try {
    return await router(path, store)
  } catch (e) {
    console.error(e)
    return RouterState.error(path, e)
  }
}
