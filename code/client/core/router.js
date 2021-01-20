import { router } from '../../common/router.js'
import { createErrorState } from '../../common/support/router_state.js'

/**
 * @param {TRouter.IPath} path
 * @param {TStore.IStore} store
 */
export async function clientRouter(path, store) {
  try {
    return await router(path, store)
  } catch (e) {
    console.error(e)
    return createErrorState(path, e)
  }
}
