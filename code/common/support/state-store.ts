import { BehaviorSubject, Observable, filter, map, startWithFactory, takeUntil } from '../observable.ts'
import { getObjectKeys } from './iteration.ts'
import { type Action } from '../types/typecons.ts'

export type SubjectProperties<T extends object> = { [K in keyof T]: BehaviorSubject<T[K]> }
export type ObservableProperties<T extends object> = { [K in keyof T]: Observable<T[K]> }

interface StateStorePayload<T extends object> {
  state: T
  lastPatchedKeys: Array<keyof T>
}

export class StateStore<T extends object> {
  #combinedSubject$: BehaviorSubject<StateStorePayload<T>>

  readonly keyedObservables: ObservableProperties<T>
  readonly combinedState$: Observable<T>
  readonly update: Action<Partial<T>>

  constructor(initial: T, unload$: Observable<void>) {
    this.#combinedSubject$ = new BehaviorSubject({
      state: initial,
      lastPatchedKeys: [],
    })

    this.update = this.#update.bind(this)
    this.combinedState$ = this.#combinedSubject$.pipe(
      takeUntil(unload$),
      map(({ state }) => state),
    )

    this.keyedObservables = Object.fromEntries(
      getObjectKeys(initial).map(key => {
        const observable = this.#combinedSubject$.pipe(
          takeUntil(unload$),
          filter(payload => payload.lastPatchedKeys.includes(key)),
          map(payload => payload.state[key]),
          startWithFactory(() => this.getState(key)),
        )

        return [key, observable]
      }),
    ) as ObservableProperties<T>
  }

  getCombinedState() {
    return this.#combinedSubject$.value.state
  }

  #update(patch: Partial<T>) {
    this.#combinedSubject$.next({
      state: { ...this.#combinedSubject$.value.state, ...patch },
      lastPatchedKeys: getObjectKeys(patch),
    })
  }

  getState<K extends keyof T>(key: K): T[K] {
    return this.#combinedSubject$.value.state[key]
  }

  setState<K extends keyof T>(key: K, value: T[K]) {
    // TypeScript 5.8.3 refuses to recognize the state as Partial<T>
    this.#update({ [key]: value } as unknown as Partial<T>)
  }
}
