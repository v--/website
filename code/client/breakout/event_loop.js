import { createIntervalObservable } from '../core/support/timeout.js'

export default class EventLoop {
  constructor (listenerMap) {
    this.listenerMap = listenerMap
    this._subscriptionMap = new Map()
  }

  start () {
    this.stop()

    for (const [listener, period] of this.listenerMap.entries()) {
      const observable = createIntervalObservable(period)
      const subscription = observable.subscribe(listener)
      this._subscriptionMap.set(listener, subscription)
    }
  }

  stop () {
    for (const [listener, subscription] of this._subscriptionMap.entries()) {
      subscription.unsubscribe()
      this._subscriptionMap.delete(listener)
    }
  }
}
