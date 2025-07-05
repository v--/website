import { Cache, type ICachePayload } from './cache.ts'

export type IManualCachePayload<V> = ICachePayload<V>

export abstract class ManualCache<K, V> extends Cache<K, V, IManualCachePayload<V>> {
  override _isCacheValid(_payload: ICachePayload<V>) {
    return true
  }

  override _addMetadata(value: V) {
    return { value }
  }
}
