const Interface = require('common/support/interface')

module.exports = {
    IObservable: Interface.create('subscribe', 'unsubscribe', 'default'),
    IObserver: Interface.create('next', 'error', 'complete')
}
