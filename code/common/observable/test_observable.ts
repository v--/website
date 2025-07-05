import { AssertionError } from 'node:assert/strict'
import { describe, it } from 'node:test'

// @ts-expect-error TS7016
import observableTests from 'es-observable-tests'

import { ObservableError, errors } from './errors.ts'
import { Observable } from './observable.ts'
import { SubscriptionObserver } from './subscription_observer.ts'
import { type uint32 } from '../types/numbers.ts'

interface NodeLogger {
  passed: uint32
  failed: uint32
  errored: uint32
  path: string[]
  margin: boolean
}

interface TestRunner {
  logger: NodeLogger
  injections: Record<string, unknown>
}

function runTests(ObservableClass: unknown): Promise<TestRunner> {
  return observableTests.runTests(ObservableClass) as unknown as Promise<TestRunner>
}

describe('Observable class', function () {
  it('passes the es-observable-tests suite', async function () {
    errors.ErrorClass = TypeError // The Observable spec requires TypeErrors
    const testResult = await runTests(Observable)
    errors.ErrorClass = ObservableError

    // The spec doesn't clean up subscriptions, so we must kill whatever is left
    SubscriptionObserver.killLivingObservers(false)

    if (testResult.logger.failed > 0) {
      throw new AssertionError({
        message: 'Test suite did not pass',
      })
    }
  })
})
