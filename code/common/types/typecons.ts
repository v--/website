export type Action<T> = (event: T) => void
export type AsyncAction<T> = (event: T) => Promise<void>
export type Getter<T> = () => T
export type Mapper<T, S> = (value: T) => S
export type Predicate<T> = (value: T) => boolean
export type ExtendedNullable<T> = T | null | undefined | false | 0 | ''

// Based on https://stackoverflow.com/a/67577722/2756776
export type Intersection<A, B> = A & B extends infer C ? { [Key in keyof C]: C[Key] } : never
