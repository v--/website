const { HTTPError } = require('common/errors')
const { splitURL } = require('common/support/strtools')
const Interface = require('common/support/interface')

const error = require('common/views/error')

const IRouterState = Interface.create({
    factory: Interface.IFunction,
    id: Interface.IString,
    title: Interface.IString,
    route: Interface.IString,
    subroute: Interface.IString,
    data: Interface.IEmpty
})

module.exports = class RouterState {
    static error(url, err) {
        const { route, subroute } = splitURL(url)

        return new this({
            route, subroute,
            id: err.viewID || 'error',
            title: err instanceof HTTPError ? err.message.toLowerCase() : 'error',
            factory: error,
            data: err
        })
    }

    constructor(rawState) {
        Interface.IFunction.assert(rawState.factory)

        Object.assign(this, {
            id: rawState.factory.name,
            title: rawState.factory.name,
            data: null
        }, rawState)

        IRouterState.assert(this)
    }
}
