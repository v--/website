import { Subscription } from '../../../common/observables/subscription.js'
import { createIntervalObservable } from './timeout.js'

export class EventLoop {
  private listenerMap = new Map<TCons.Action<void>, number>()
  private subscriptionMap = new Map<TCons.Action<void>, Subscription<void>>()
  private started = false

  add(listener: TCons.Action<void>, period: number) {
    this.listenerMap.set(listener, period)

    if (this.started) {
      const observable = createIntervalObservable(period)
      const subscription = observable.subscribe(listener)
      this.subscriptionMap.set(listener, subscription)
    }
  }

  remove(listener: TCons.Action<void>) {
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
