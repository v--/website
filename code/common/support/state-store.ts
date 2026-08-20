import { BehaviorSubject, Observable, filter, map, scan, startWithFactory, takeUntil } from '../observable.ts'
import { getObjectKeys } from './iteration.ts'
import { type Action } from '../types/typecons.ts'

export type SubjectProperties<T extends object> = { [K in keyof T]: BehaviorSubject<T[K]> }
export type ObservableProperties<T extends object> = { [K in keyof T]: Observable<T[K]> }

export class StateStore<T extends object> {
  #updateSubject$: BehaviorSubject<Partial<T>>
  #combinedSubject$: BehaviorSubject<T>

  readonly keyedObservables: ObservableProperties<T>
  readonly combinedState$: Observable<T>
  readonly stateUpdate$: Observable<Partial<T>>
  readonly update: Action<Partial<T>>

  constructor(initial: T, unload$: Observable<void>) {
    this.#updateSubject$ = new BehaviorSubject({})
    this.#combinedSubject$ = new BehaviorSubject(initial)

    this.stateUpdate$ = this.#updateSubject$.pipe(
      takeUntil(unload$),
    )

    this.combinedState$ = this.stateUpdate$.pipe(
      scan((accum, patch) => ({ ...accum, ...patch }), initial),
    )

    this.combinedState$.subscribe(this.#combinedSubject$)

    this.keyedObservables = Object.fromEntries(
      getObjectKeys(initial).map(key => {
        const observable = this.stateUpdate$.pipe(
          filter(patch => key in patch),
          map(patch => patch[key]),
          startWithFactory(() => initial[key]),
        )

        return [key, observable]
      }),
    ) as ObservableProperties<T>

    this.update = this.#update.bind(this)
  }

  getCombinedState() {
    return this.#combinedSubject$.value
  }

  #update(patch: Partial<T>) {
    this.#updateSubject$.next(patch)
  }

  getState<K extends keyof T>(key: K): T[K] {
    return this.#combinedSubject$.value[key]
  }

  setState<K extends keyof T>(key: K, value: T[K]) {
    // TypeScript 5.8.3 refuses to recognize the state as Partial<T>
    this.#update({ [key]: value } as unknown as Partial<T>)
  }
}
