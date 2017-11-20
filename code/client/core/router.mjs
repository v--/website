import router from '../../common/router'
import RouterState from '../../common/support/router_state'

export default async function clientRouter(db, url) {
    try {
        return await router(db, url)
    } catch (e) {
        return RouterState.error(url, e)
    }
}
