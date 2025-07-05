import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Observable } from '../observable.ts'
import { collect } from './collect.ts'
import { combineLatest } from './combine_latest.ts'

describe('combineLatest observable operator', function () {
  it('combines several observables into a record', async function () {
    const observable$ = combineLatest({
      a: Observable.of(1),
      b: Observable.of(2),
    })

    const values = await collect(observable$)
    assert.deepEqual(values, [{ a: 1, b: 2 }])
  })

  it('allows constant values', async function () {
    const observable$ = combineLatest({
      a: Observable.of(1),
      b: Observable.of(2),
      c: 3,
    })

    const values = await collect(observable$)
    assert.deepEqual(values, [{ a: 1, b: 2, c: 3 }])
  })

  it('continues emitting after the first time', async function () {
    const observable$ = combineLatest({
      a: Observable.of(1),
      b: Observable.of(2, 3),
    })

    const values = await collect(observable$)
    assert.deepEqual(values, [{ a: 1, b: 2 }, { a: 1, b: 3 }])
  })
})
