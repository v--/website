export type FlattenIterableType<T> = T | Iterable<FlattenIterableType<T>>
export type IterBase<T> = T extends Iterable<infer R> ? R : T
export type Action<T> = (event: T) => void
export type AsyncAction<T> = (event: T) => Promise<void>
export type Getter<T> = () => T
export type Resolver<T> = Getter<Promise<T>>
export type Predicate<T> = (value: T) => boolean
export type Reducer<T, S> = (accum: S, value: T) => S
export type Mapper<T, S> = (value: T) => S
export type ExtendedNullable<T> = T | null | undefined | false | 0 | ''

// Based on https://stackoverflow.com/a/67577722/2756776
export type Intersection<A, B> = A & B extends infer C ? { [Key in keyof C]: C[Key] } : never
