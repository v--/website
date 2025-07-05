import { IntegrityError } from '../errors.ts'
import { mod } from './floating.ts'
import { type uint32 } from '../types/numbers.ts'

class CircularBufferError extends IntegrityError {}
class BufferCapacityError extends CircularBufferError {}
class EmptyBufferError extends CircularBufferError {}

export class CircularBuffer<T> {
  #payload: Array<T> = []
  #index?: uint32
  readonly capacity: uint32

  constructor(capacity: uint32) {
    if (capacity < 1 || !Number.isInteger(capacity)) {
      throw new BufferCapacityError('The buffer capacity must be a positive integer')
    }

    this.capacity = capacity
  }

  getSize() {
    return this.#payload.length
  }

  push(value: T) {
    this.#index = mod((this.#index ?? -1) + 1, this.capacity)
    this.#payload[this.#index] = value
  }

  peek(): T {
    if (this.getSize() === 0) {
      throw new EmptyBufferError('The buffer is empty')
    }

    return this.#payload[this.#index ?? 0]
  }

  * [Symbol.iterator]() {
    if (this.#index === undefined) {
      return
    }

    const size = this.getSize()

    for (let i = -size + 1; i <= 0; i++) {
      yield this.#payload[mod(this.#index + i, size)]
    }
  }
}
