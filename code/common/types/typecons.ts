import { IObservable } from '../observables/observable.js'

export type PartialWith<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredWith<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
export type Constructor<Params extends unknown[], Class> = new (...args: Params) => Class
export type Optional<T> = T | undefined
export type IterBase<T> = T extends Iterable<infer R> ? R : T
export type ObservableBase<T> = T extends IObservable<infer R> ? R : T
export type Action<T> = (event: T) => void
