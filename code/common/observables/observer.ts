import { Subscription } from './subscription.js'

export interface IObserver<T> {
  start?(subscription : Subscription<T>): void
  next(value: T): void
  error(err: Error): void
  complete(value?: T): void
}

export type PotentialObserver<T> = Partial<IObserver<T>> | ((value: T) => void)
