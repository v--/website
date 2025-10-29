import { AsyncLock } from '../support/async_lock.ts'
import { type IFinalizeable } from '../types/finalizable.ts'

export interface ICachePayload<V> {
  value: V
}

export abstract class Cache<K, V, PayloadT extends ICachePayload<V> = ICachePayload<V>> implements IFinalizeable {
  #payloads = new Map<string, PayloadT>()
  #lock = new AsyncLock()

  abstract _resolveValue(key: K): Promise<V>
  protected abstract _isCacheValid(payload: PayloadT): boolean
  protected abstract _addMetadata(value: V): PayloadT

  protected _stringifyKey(key: K) {
    return JSON.stringify(key)
  }

  invalidate(key: K) {
    const skey = this._stringifyKey(key)
    this.#payloads.delete(skey)
  }

  putIntoCache(key: K, value: V) {
    const skey = this._stringifyKey(key)
    const payload = this._addMetadata(value)
    this.#payloads.set(skey, payload)
  }

  async getValue(key: K) {
    await this.#lock.aquire()
    const skey = this._stringifyKey(key)
    const payload = this.#payloads.get(skey)

    if (payload && this._isCacheValid(payload)) {
      await this.#lock.release()
      return payload.value
    }

    try {
      const value = await this._resolveValue(key)
      this.#payloads.set(skey, this._addMetadata(value))
      return value
    } finally {
      await this.#lock.release()
    }
  }

  async refetch(key: K) {
    this.invalidate(key)
    await this.getValue(key)
  }

  async finalize() {
    await this.#lock.finalize()
  }
}
