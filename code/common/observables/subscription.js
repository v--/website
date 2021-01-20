import { SubscriptionObserver } from './subscription_observer.js'

/**
 * @template T
 * @implements Observables.ISubscription
 */
export class Subscription {
  /**
   * @param {SubscriptionObserver<T>} subscriptionObserver
   */
  constructor(subscriptionObserver) {
    this.subscriptionObserver = subscriptionObserver
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
