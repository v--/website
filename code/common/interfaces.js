const { repr } = require('common/support/strtools')
const Interface = require('common/support/interface')

const IString = {
    assert(instance) {
        if (typeof instance !== 'string')
            throw new Interface.InterfaceNotImplementedError(`${repr(instance)} must be a string`)
    },

    [Symbol.hasInstance](instance) {
        return typeof instance === 'string'
    }
}

module.exports = {
    IString,
    IObservable: Interface.create('subscribe', 'unsubscribe', 'default'),
    IObserver: Interface.create('next', 'error', 'complete')
}
