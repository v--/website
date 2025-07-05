import { Cache, type ICachePayload } from '../../common/cache.ts'

export class MockCache<K, V> extends Cache<K, V, ICachePayload<V>> {
  override _resolveValue(_key: K): Promise<V> {
    return new Promise((_resolve, _reject) => {})
  }

  protected override _isCacheValid(_payload: ICachePayload<V>) {
    return true
  }

  protected override _addMetadata(value: V) {
    return { value }
  }
}
