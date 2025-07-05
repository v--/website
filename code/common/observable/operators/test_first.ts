import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Observable } from '../observable.ts'
import { first } from './first.ts'

describe('first observable operator', function () {
  it('takes the first value of an infinite observable', async function () {
    const observable$ = new Observable(observer => {
      observer.next('value')
    })

    const value = await first(observable$)
    assert.deepEqual(value, 'value')
  })
})
