export interface NonStrictMap<K, V> extends Map<K, V> {
  get(key: K): V
}
