import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Observable } from '../observable.ts'
import { collect } from './collect.ts'
import { startWith } from './start_with.ts'

describe('startWith observable operator', function () {
  it('preserves the original behavior with no arguments', async function () {
    const observable$ = Observable.of(1, 2, 3).pipe(
      startWith(),
    )

    const values = await collect(observable$)
    assert.deepEqual(values, [1, 2, 3])
  })

  it('adds a new item in front of the rest', async function () {
    const observable$ = Observable.of(1, 2, 3).pipe(
      startWith(0),
    )

    const values = await collect(observable$)
    assert.deepEqual(values, [0, 1, 2, 3])
  })
})
