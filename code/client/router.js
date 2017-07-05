const router = require('common/router')
const RouterState = require('common/support/router_state')

module.exports = async function clientRouter(db, url) {
    try {
        return await router(db, url)
    } catch (e) {
        return RouterState.error(url, e)
    }
}
