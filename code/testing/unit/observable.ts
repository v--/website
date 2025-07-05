import { AssertionError } from 'node:assert/strict'

import { SubscriptionObserver } from '../../common/observable.ts'

export function assertNoLivingObservableSubscriptions() {
  const livingCount = SubscriptionObserver.getLivingObserverCount()

  if (livingCount > 0) {
    SubscriptionObserver.killLivingObservers(true)

    throw new AssertionError({
      message: livingCount === 1 ?
        'There is a living observable subscription left' :
        `There are ${livingCount} living observables subscriptions left`,
    })
  }
}
