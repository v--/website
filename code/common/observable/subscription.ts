import { type SubscriptionObserver } from './subscription_observer.ts'
import { type ISubscription } from './types.ts'

export class Subscription<T, V = void> implements ISubscription {
  readonly subscriptionObserver: SubscriptionObserver<T, V>

  constructor(subscriptionObserver: SubscriptionObserver<T, V>) {
    this.subscriptionObserver = subscriptionObserver
    this.unsubscribe = this.unsubscribe.bind(this)
  }

  unsubscribe() {
    this.subscriptionObserver.complete()
  }

  get closed() {
    return this.subscriptionObserver.closed
  }
}

// This is required by the spec
Subscription.prototype.constructor = Object
