declare namespace TObservables {
  export interface ISubscription {
    unsubscribe(): void
    closed: boolean
  }

  export type CleanupFunction = (() => void)
  export type Cleanup = ISubscription | CleanupFunction | null | undefined

  export interface IObserver<T> {
    start?(subscription: TObservables.ISubscription): void
    next(value: T): void
    error(err: Error): void
    complete(value?: T): void
  }

  export interface ISubscriptionObserver<T> extends IObserver<T> {
    subscribe(subscriber: SubscriberFunction<T>): void
  }

  export interface SubscriberFunction<T> {
    (observer: IObserver<T>): Cleanup | ISubscription | void;
  }

  export type IPotentialObserver<T> = Partial<IObserver<T>> | ((value: T) => void)

  export interface IObservable<T> {
    '@@observable'(): IObservable<T>
    subscribe(potentialObserver: IPotentialObserver<T>): ISubscription
  }

  export type ISubject<T> = IObserver<T> & IObservable<T>

  export type BaseType<T> = T extends IObservable<infer R> ? R : T
}
