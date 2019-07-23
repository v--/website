export default class Subscription {
  constructor (subscriptionObserver) {
    this.subscriptionObserver = subscriptionObserver
  }

  unsubscribe () {
    this.subscriptionObserver.complete()
  }

  get closed () {
    return this.subscriptionObserver.closed
  }
}

// This is required by the spec
Subscription.prototype.constructor = Object
