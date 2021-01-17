/* eslint-disable no-restricted-syntax */

declare module 'gulp-svgo' {
  export default function (): NodeJS.ReadWriteStream
}

declare module 'gulp-dart-sass' {
  export default function (options: { outputStyle: 'compressed' }): NodeJS.ReadWriteStream
}

declare module 'es-observable-tests' {
  class API {
    static runTests(_observable: unknown): void
  }

  export default API
}

// https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing/
declare interface Flavoring<K extends string> {
  ['@@flavoringSymbol']?: K
}

declare type Flavor<T, K extends string> = T & Flavoring<K>

// numeric types
declare type uint32 = Flavor<number, 'uint32'>
declare type int32 = Flavor<number, 'int32'> | uint32

declare type UnitRatio = Flavor<number, 'UnitRatio'>
declare type float64 = Flavor<number, 'float64'> | int32 | UnitRatio

// typecons
declare type PartialWith<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
declare type RequiredWith<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
declare type Constructor<Params extends unknown[], Class> = new (...args: Params) => Class
declare type Optional<T> = T | undefined
declare type IterBase<T> = T extends Iterable<infer R> ? R : T
declare type Action<T> = (event: T) => void
