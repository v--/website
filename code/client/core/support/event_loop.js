import { Subscription } from '../../../common/observables/subscription.js'
import { createIntervalObservable } from './timeout.js'

/**
 * @implements TEvents.IEventLoop
 */
export class EventLoop {
  constructor() {
    /**
     * @type {Map<TCons.Action<void>, TNum.UInt32>}
     * @private
     */
    this.listenerMap = new Map()

    /**
     * @type {Map<TCons.Action<void>, Subscription<void>>}
     * @private
     */
    this.subscriptionMap = new Map()

    /** @private */
    this.started = false
  }

  /**
   * @param {TCons.Action<void>} listener
   * @param {TNum.UInt32} period
   */
  add(listener, period) {
    this.listenerMap.set(listener, period)

    if (this.started) {
      const observable = createIntervalObservable(period)
      const subscription = observable.subscribe(listener)
      this.subscriptionMap.set(listener, subscription)
    }
  }

  /**
   * @param {TCons.Action<void>} listener
   */
  remove(listener) {
    this.listenerMap.delete(listener)
    const subscription = this.subscriptionMap.get(listener)

    if (this.started && subscription) {
      subscription.unsubscribe()
      this.subscriptionMap.delete(listener)
    }
  }

  clear() {
    this.stop()
    this.listenerMap.clear()
    this.subscriptionMap.clear()
  }

  start() {
    this.stop()

    for (const [listener, period] of this.listenerMap.entries()) {
      const observable = createIntervalObservable(period)
      const subscription = observable.subscribe(listener)
      this.subscriptionMap.set(listener, subscription)
    }
  }

  stop() {
    for (const [listener, subscription] of this.subscriptionMap.entries()) {
      subscription.unsubscribe()
      this.subscriptionMap.delete(listener)
    }
  }
}
