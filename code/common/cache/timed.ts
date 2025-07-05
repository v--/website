import { Cache, type ICachePayload } from './cache.ts'
import { type uint32 } from '../types/numbers.ts'

interface ITimedCachePayload<V> extends ICachePayload<V> {
  accessTimestamp: uint32
}

export abstract class TimedCache<K, V> extends Cache<K, V, ITimedCachePayload<V>> {
  readonly maxMilliseconds: uint32

  constructor(maxMilliseconds: uint32) {
    super()
    this.maxMilliseconds = maxMilliseconds
  }

  override _isCacheValid(payload: ITimedCachePayload<V>) {
    return performance.now() - payload.accessTimestamp < this.maxMilliseconds
  }

  override _addMetadata(value: V) {
    return { value, accessTimestamp: performance.now() }
  }
}
