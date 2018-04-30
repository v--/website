import router from '../../common/router'
import RouterState from '../../common/support/router_state'

export default async function clientRouter (path, db) {
  try {
    return await router(path, db)
  } catch (e) {
    return RouterState.error(path, e)
  }
}
