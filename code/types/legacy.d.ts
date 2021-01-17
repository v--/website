// https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing/
export interface Flavoring<K extends string> {
  ['@@flavoringSymbol']?: K
}

export type Flavor<T, K extends string> = T & Flavoring<K>

// numeric types
export type uint32 = Flavor<number, 'uint32'>
export type int32 = Flavor<number, 'int32'> | uint32

export type UnitRatio = Flavor<number, 'UnitRatio'>
export type float64 = Flavor<number, 'float64'> | int32 | UnitRatio

// typecons
export type PartialWith<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredWith<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
export type Constructor<Params extends unknown[], Class> = new (...args: Params) => Class
export type Optional<T> = T | undefined
export type FlattenIterableType<T> = T | Iterable<FlattenIterableType<T>>
export type IterBase<T> = T extends Iterable<infer R> ? R : T
export type Action<T> = (event: T) => void

// misc
export interface NonStrictMap<K, V> extends Map<K, V> {
  get(key: K): V
}
