import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { waitForTime } from '../../support/async.ts'
import { Observable } from '../observable.ts'
import { collect } from './collect.ts'
import { concatMap } from './concat_map.ts'

describe('concatMap obsevable operator', function () {
  it('processes entries in order', async function () {
    const observable$ = Observable.of(20, 10, 1).pipe(
      concatMap(async function (time) {
        await waitForTime(time)
        return time
      }),
    )

    const values = await collect(observable$)
    assert.deepEqual(values, [20, 10, 1])
  })
})
