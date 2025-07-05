import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Subject } from './subject.ts'
import { assertTrue } from '../../testing/assertion.ts'
import { assertNoLivingObservableSubscriptions } from '../../testing/unit/observable.ts'
import { type uint32 } from '../types/numbers.ts'

describe('Subject class', function () {
  it('creates to subscriptions on its own', function () {
    // eslint-disable-next-line @unused-imports/no-unused-vars
    const subject$ = new Subject<uint32>()
    assertNoLivingObservableSubscriptions()
  })

  it('emits values to a subscriber', function () {
    const subject$ = new Subject<uint32>()
    const values: uint32[] = []

    const sub = subject$.subscribe({
      next(value) {
        values.push(value)
      },
    })

    assert.deepEqual(values, [])

    subject$.next(1)
    assert.deepEqual(values, [1])

    subject$.next(2)
    assert.deepEqual(values, [1, 2])

    sub.unsubscribe()
  })

  it('emits errors to old subscribers', function () {
    const subject$ = new Subject<void>()
    const error = new TypeError('test')
    let recordedError: unknown = undefined

    subject$.subscribe({
      error(err) {
        recordedError = err
      },
    })

    subject$.error(error)
    assert.equal(error, recordedError)
  })

  it('emits errors to new subscribers', function () {
    const subject$ = new Subject<void>()
    const error = new TypeError('test')
    let recordedError: unknown = undefined
    subject$.error(error)

    subject$.subscribe({
      error(err) {
        recordedError = err
      },
    })

    assert.equal(error, recordedError)
  })

  it('emits completion events to old subscribers', function () {
    const subject$ = new Subject<void>()
    let hasCompleted = false

    subject$.subscribe({
      complete() {
        hasCompleted = true
      },
    })

    subject$.complete()
    assertTrue(hasCompleted)
  })

  it('emits completion events to new subscribers', function () {
    const subject$ = new Subject<void>()
    let hasCompleted = false

    subject$.complete()
    subject$.subscribe({
      complete() {
        hasCompleted = true
      },
    })

    assertTrue(hasCompleted)
  })
})
