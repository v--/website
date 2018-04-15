import router from '../../common/router'
import RouterState from '../../common/support/router_state'

export default async function clientRouter(db, path) {
    try {
        return await router(db, path)
    } catch (e) {
        return RouterState.error(path, e)
    }
}
