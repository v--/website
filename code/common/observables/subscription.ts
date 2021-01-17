import { SubscriptionObserver } from './subscription_observer.js'

export class Subscription<T> implements Observables.ISubscription {
  constructor(
    private subscriptionObserver: SubscriptionObserver<T>
  ) {}

  unsubscribe() {
    this.subscriptionObserver.complete()
  }

  get closed() {
    return this.subscriptionObserver.closed
  }
}

// This is required by the spec
Subscription.prototype.constructor = Object
