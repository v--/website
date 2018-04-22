import router from '../../common/router'
import RouterState from '../../common/support/router_state'

export default async function clientRouter(path) {
    try {
        return await router(path, models)
    } catch (e) {
        return RouterState.error(path, e)
    }
}
