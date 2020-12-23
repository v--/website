import { SubscriptionObserver } from './subscription_observer.js'

export interface ISubscription {
  unsubscribe(): void
  closed: boolean
}

export class Subscription<T> implements ISubscription {
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
