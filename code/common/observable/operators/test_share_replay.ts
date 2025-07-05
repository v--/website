import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Subject } from '../subject.ts'
import { type IObserver } from '../types.ts'
import { shareReplay } from './share_replay.ts'

describe('shareReplay observable operator', function () {
  it('binds to the observable until termination', async function () {
    class SubjectExtension<T> extends Subject<T> {
      counter = 0

      _subjectSubscriber(observer: IObserver<T>) {
        const unsubscribe = super._subjectSubscriber(observer)

        this.counter += 1

        return () => {
          this.counter -= 1
          return unsubscribe()
        }
      }
    }

    const source$ = new SubjectExtension<void>()
    const shared$ = source$.pipe(shareReplay())

    const sub1 = shared$.subscribe(_observer => {})
    const sub2 = shared$.subscribe(_observer => {})
    assert.equal(source$.counter, 1)

    sub1.unsubscribe()
    sub2.unsubscribe()
    assert.equal(source$.counter, 1)

    source$.complete()
    assert.equal(source$.counter, 0)
  })
})
