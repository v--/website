import { type uint32 } from '../../types/numbers.ts'
import { Observable } from '../observable.ts'
import { ReplaySubject } from '../replay_subject.ts'

export function shareReplay<T>(bufferSize: uint32 = 1) {
  return function (observable: Observable<T>): Observable<T> {
    const subject = new ReplaySubject(bufferSize)
    observable.subscribe(subject)
    return subject
  }
}
