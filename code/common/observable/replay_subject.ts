import { Subject } from './subject.ts'
import { type IObserver } from './types.ts'
import { CircularBuffer } from '../support/circular_buffer.ts'
import { type uint32 } from '../types/numbers.ts'

export class ReplaySubject<T, V = void> extends Subject<T, V> {
  protected _buffer: CircularBuffer<T>
  readonly bufferSize: uint32

  constructor(
    bufferSize: uint32 = 1,
  ) {
    super()
    this.bufferSize = bufferSize
    this._buffer = new CircularBuffer(bufferSize)
  }

  override _subjectSubscriber(observer: IObserver<T, V>) {
    const unsubscribe = super._subjectSubscriber(observer)

    for (const value of this._buffer) {
      observer.next(value)
    }

    return unsubscribe
  }

  next(value: T) {
    this._buffer.push(value)
    return super.next(value)
  }
}
