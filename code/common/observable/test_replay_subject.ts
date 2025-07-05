import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ReplaySubject } from './replay_subject.ts'
import { type uint32 } from '../types/numbers.ts'

describe('ReplaySubject class', function () {
  it('Records its last values', async function () {
    const subject$ = new ReplaySubject<uint32>(3)
    subject$.next(1)
    subject$.next(2)
    subject$.next(3)

    const values: uint32[] = []
    const sub = subject$.subscribe({
      next(value) {
        values.push(value)
      },
    })

    assert.deepEqual(values, [1, 2, 3])
    sub.unsubscribe()
  })

  it('Drops its oldest elements', async function () {
    const subject$ = new ReplaySubject<uint32>(2)
    subject$.next(1)
    subject$.next(2)
    subject$.next(3)

    const values: uint32[] = []
    const sub = subject$.subscribe({
      next(value) {
        values.push(value)
      },
    })

    assert.deepEqual(values, [2, 3])
    sub.unsubscribe()
  })
})
