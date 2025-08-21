import { BehaviorSubject, Observable, takeUntil } from '../observable.ts'
import { getObjectEntries } from './iteration.ts'
import { type Action } from '../types/typecons.ts'

export type SubjectProperties<T extends object> = { [K in keyof T]: BehaviorSubject<T[K]> }
export type ObservableProperties<T extends object> = { [K in keyof T]: Observable<T[K]> }

export class StateStore<T extends object> {
  #combinedSubject$: BehaviorSubject<T>
  #subjects: SubjectProperties<T>

  keyedObservables: ObservableProperties<T>
  combinedState$: Observable<T>
  update: Action<Partial<T>>

  constructor(initial: T, unload$: Observable<void>) {
    this.#combinedSubject$ = new BehaviorSubject(initial)
    this.#subjects = Object.fromEntries(
      getObjectEntries(initial).map(([key, value]) => [key, new BehaviorSubject(value)]),
    ) as SubjectProperties<T>

    this.keyedObservables = Object.fromEntries(
      getObjectEntries(this.#subjects).map(([key, subject$]) => {
        return [key, subject$.pipe(takeUntil(unload$))]
      }),
    ) as ObservableProperties<T>

    this.update = this.#update.bind(this)
    this.combinedState$ = this.#combinedSubject$.pipe(takeUntil(unload$))
  }

  #update(payload: Partial<T>) {
    this.#combinedSubject$.next({ ...this.#combinedSubject$.value, ...payload })

    for (const [key, value] of getObjectEntries(payload)) {
      this.#subjects[key].next(value as T[keyof T])
    }
  }

  getState<K extends keyof T>(key: K): T[K] {
    return this.#subjects[key].value
  }

  setState<K extends keyof T>(key: K, value: T[K]) {
    this.#subjects[key].next(value)
    this.#combinedSubject$.next({ ...this.#combinedSubject$.value, [key]: value })
  }

  getCombinedState() {
    return this.#combinedSubject$.value
  }
}
