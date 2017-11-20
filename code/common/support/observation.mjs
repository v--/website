import Interface, { IObject } from './interface'

export const IObservable = Interface.create({ subscribe: Function, unsubscribe: Function, current: IObject })
export const IObserver = Interface.methods('next', 'error', 'complete')

export class Observable {
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

    emit(value) {
        for (const observer of this.observers)
            observer.next(value)
    }

    update(value) {
        this.replace(Object.assign({}, this.current, value))
    }

    replace(value) {
        this.emit(value)
        this.current = value
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
