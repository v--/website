const Interface = require('common/support/interface')

module.exports = {
    IObservable: Interface.create({ subscribe: Interface.IFunction, unsubscribe: Interface.IFunction, default: Interface.IObject }),
    IObserver: Interface.methods('next', 'error', 'complete')
}
