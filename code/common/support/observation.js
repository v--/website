const Interface = require('common/support/interface')

const IObservable = Interface.create({ subscribe: Interface.IFunction, unsubscribe: Interface.IFunction, current: Interface.IObject })
const IObserver = Interface.methods('next', 'error', 'complete')

class Observable {
    constructor(initialValue) {
        this.current = initialValue
        this.observers = new Set()
    }

    subscribe(observer) {
        IObserver.assert(observer)
        this.observers.add(observer)
    }

    unsubscribe(observer) {
        this.observers.delete(observer)
    }

    emitCurrent() {
        for (const observer of this.observers)
            observer.next(this.current)
    }

    update(value) {
        this.current = Object.assign({}, this.current, value)
        this.emitCurrent()
    }

    replace(value) {
        this.current = value
        this.emitCurrent()
    }

    complete() {
        for (const observer of this.observers)
            observer.complete()
    }

    map(transform) {
        const result = new Observable(transform(this.current))

        this.subscribe({
            next(value) {
                result.replace(transform(value))
            },

            error(err) {
                throw err
            },

            complete() {
                result.complete()
            }
        })

        return result
    }
}

module.exports = { IObservable, IObserver, Observable }
