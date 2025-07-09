import { afterEach } from 'node:test'

import { assertNoLivingObservableSubscriptions } from './observable.ts'

afterEach(function () {
  assertNoLivingObservableSubscriptions()
})
