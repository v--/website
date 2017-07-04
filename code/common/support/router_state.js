const Interface = require('common/support/interface')

const IRouterState = Interface.create({
    factory: Interface.IFunction,
    id: Interface.IString,
    title: Interface.IString,
    route: Interface.IString,
    subroute: Interface.IString,
    data: Interface.IEmpty
})

module.exports = class RouterState {
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
