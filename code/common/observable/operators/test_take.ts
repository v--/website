import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Observable } from '../observable.ts'
import { collect } from './collect.ts'
import { take } from './take.ts'

describe('take observable operator', function () {
  it('takes the first values of an observable with many values', async function () {
    const observable$ = Observable.of(1, 2, 3, 4, 5).pipe(
      take(2),
    )

    const values = await collect(observable$)
    assert.deepEqual(values, [1, 2])
  })

  it('takes as many values as it can', async function () {
    const observable$ = Observable.of(1, 2, 3, 4, 5).pipe(
      take(10),
    )

    const values = await collect(observable$)
    assert.deepEqual(values, [1, 2, 3, 4, 5])
  })
})
