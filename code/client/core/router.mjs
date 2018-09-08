import router from '../../common/router.mjs'
import RouterState from '../../common/support/router_state.mjs'

export default async function clientRouter (path, db) {
  try {
    return await router(path, db)
  } catch (e) {
    return RouterState.error(path, e)
  }
}
