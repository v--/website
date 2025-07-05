import { ReplaySubject } from './replay_subject.ts'

export class BehaviorSubject<T, V = void> extends ReplaySubject<T, V> {
  constructor(value: T) {
    super(1)
    this.next(value)
  }

  // I avoid getters generally, but this is a getter for compatibility with RxJS
  get value(): T {
    return this._buffer.peek()
  }
}
