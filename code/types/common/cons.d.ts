declare namespace TCons {
  export type PartialWith<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
  export type RequiredWith<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
  export type Constructor<Params extends unknown[], Class> = new (...args: Params) => Class
  export type FlattenIterableType<T> = T | Iterable<FlattenIterableType<T>>
  export type IterBase<T> = T extends Iterable<infer R> ? R : T
  export type Action<T> = (event: T) => void
  export type Predicate<T> = (value: T) => boolean
  export type Reducer<T, S> = (value: T, accum: S) => S
  export type Mapper<T, S> = (value: T) => S
  export interface NonStrictMap<K, V> extends Map<K, V> {
    get(key: K): V
  }
}
