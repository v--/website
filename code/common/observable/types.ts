import { type Action, type AsyncAction } from '../types/typecons.ts'

export interface ISubscription {
  unsubscribe(): void
  closed: boolean
}

export type CleanupFunction = Action<void>
export type Cleanup = ISubscription | CleanupFunction | null | undefined

export interface IObserver<T, V = void> {
  start?(subscription: ISubscription): void
  next(value: T): void
  error(err: unknown): void
  complete(value?: V): void
}

export interface IAsyncObserver<T, V = void> {
  start?(subscription: ISubscription): void
  next(value: T): Promise<void>
  error(err: unknown): void | Promise<void>
  complete(value?: V): void | Promise<void>
}

export interface SubscriberFunction<T, V = void> {
  (observer: IObserver<T, V>): Cleanup | void
}

export type IPotentialObserver<T, V = void> = Partial<IObserver<T, V>> | Action<T>
export type IPotentialAsyncObserver<T, V = void> = Partial<IAsyncObserver<T, V>> | AsyncAction<T>
