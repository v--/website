const Interface = require('common/support/interface')

const IObservable = Interface.create({ subscribe: Interface.IFunction, unsubscribe: Interface.IFunction, default: Interface.IObject })
const IObserver = Interface.methods('next', 'error', 'complete')

class Observable {
    constructor(defaultValue) {
        this.default = defaultValue
        this.observers = new Set()
    }

    subscribe(observer) {
        IObserver.assert(observer)
        this.observers.add(observer)
    }

    unsubscribe(observer) {
        this.observers.delete(observer)
    }

    emit(value) {
        for (const observer of this.observers)
            observer.next(value)
    }

    complete() {
        for (const observer of this.observers)
            observer.complete()
    }
}

module.exports = { IObservable, IObserver, Observable }
