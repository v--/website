import { router } from '../../common/router.js'
import { Path } from '../../common/support/path.js'
import { RouterState } from '../../common/support/router_state.js'
import { IStore } from '../../common/types/store.js'

export async function clientRouter(path: Path, store: IStore) {
  try {
    return await router(path, store)
  } catch (e) {
    console.error(e)
    return RouterState.error(path, e)
  }
}
