import { ComponentSanityError } from './errors.ts'
import { Observable, ReplaySubject, type Subscription, combineLatest, first } from '../../observable.ts'
import { recursivelyStringify, repr } from '../../support/strings.ts'
import { type IFinalizeable } from '../../types/finalizable.ts'
import { type uint32 } from '../../types/numbers.ts'

export type ComponentType = unknown
export type IComponentState = object | undefined
export type IComponentEnvironment = object

/**
 * The state source can either be undefined, an observable, or an object whose values may or may not be observable
 */
export type IComponentStateSource<StateT extends IComponentState = IComponentState> =
  StateT extends undefined ? undefined : { [K in keyof StateT]: StateT[K] | Observable<StateT[K]> } | Observable<StateT>

export abstract class Component<TypeT = ComponentType, StateT extends IComponentState = IComponentState> implements IFinalizeable {
  #state$ = new ReplaySubject<StateT>(1)
  #stateSubscription?: Subscription<StateT>
  #stateSource: IComponentStateSource<StateT>
  #children: Array<Component>

  readonly state$: Observable<StateT>
  readonly type: TypeT

  constructor(
    type: TypeT,
    stateSource: IComponentStateSource<StateT>,
    children: Iterable<Component>,
  ) {
    this.type = type
    this.state$ = this.#state$
    this.#children = Array.from(children)
    this.#stateSource = stateSource
    this.#updateStateSource(stateSource, true)
  }

  prevalidateNewState(newState: StateT): void {
    if (newState instanceof Component) {
      throw new ComponentSanityError('We have forbidden the state of a component to be a component; this is likely a usage error.')
    }
  }

  updateState(newState: StateT) {
    this.prevalidateNewState(newState)
    this.#state$.next(newState)
  }

  getState(): Promise<StateT> {
    return first(this.#state$)
  }

  getStateSource(): IComponentStateSource<StateT> {
    return this.#stateSource
  }

  getChildren(): Readonly<Component[]> {
    return this.#children
  }

  hasChildren() {
    return this.#children.length > 0
  }

  updateChildren(children: Iterable<Component>) {
    this.#children = Array.from(children)
  }

  unsubscribeFromStateSource() {
    if (this.#stateSubscription) {
      this.#stateSubscription.unsubscribe()
    }
  }

  #updateStateSource(newSource: IComponentStateSource<StateT>, alwaysTriggerUpdate: boolean) {
    if (newSource instanceof Component) {
      throw new ComponentSanityError('We have forbidden the state source of a component to be a component; this is likely a usage error.')
    }

    this.unsubscribeFromStateSource()

    if (newSource === undefined) {
      if (alwaysTriggerUpdate || this.#stateSource !== undefined) {
        this.updateState(newSource as StateT)
      }

      this.#stateSource = newSource
      return
    }

    if (!(newSource instanceof Object)) {
      throw new ComponentSanityError('Invalid component state source', { newSource })
    }

    if (Observable.isObservable(newSource)) {
      this.#stateSubscription = (newSource as Observable<StateT>).subscribe({
        next: value => {
          try {
            this.updateState(value)
          } catch (err) {
            this.#state$.error(err)
          }
        },
        error: err => {
          this.#state$.error(err)
        },
      })
    } else if (newSource.constructor !== Object) {
      throw new ComponentSanityError('To prevent user errors, only observables and plain objects are allowed as state source.', { newSource })
    } else if (Object.values(newSource).some(value => Observable.isObservable(value))) {
      this.#stateSubscription = (combineLatest(newSource as Record<string, unknown>) as Observable<StateT>).subscribe({
        next: value => {
          try {
            this.updateState(value)
          } catch (err) {
            this.#state$.error(err)
          }
        },
        error: err => {
          this.#state$.error(err)
        },
      })
    } else if (alwaysTriggerUpdate || newSource !== this.#stateSource) {
      this.updateState(newSource as StateT)
    }

    this.#stateSource = newSource
  }

  updateStateSource(newSource: IComponentStateSource<StateT>) {
    this.#updateStateSource(newSource, false)
  }

  async finalize() {
    this.unsubscribeFromStateSource()
    this.#state$.complete()
  }

  #getStringPrefix(builderName: string): string {
    const builderString = `${builderName}(${repr(this.type)}`

    if (this.#stateSource === undefined) {
      if (this.hasChildren()) {
        return builderString + ', undefined'
      }

      return builderString
    }

    const isStateDynamic = Observable.isObservable(this.#stateSource) || Object.values(this.#stateSource).some(v => Observable.isObservable(v))

    if (isStateDynamic) {
      return builderString + ', <dynamic state>'
    }

    return builderString + ', ' + repr(this.#stateSource)
  }

  toString(indentation: uint32 = 0, builderName: string = '?'): string {
    const prefix = this.#getStringPrefix(builderName)
    const childIter = this.getChildren()

    return recursivelyStringify({
      prefix: this.hasChildren() ? prefix + ',' : prefix,
      suffix: ')',
      indentation,
      * iterChildren(largeIndentation?: uint32) {
        for (const child of childIter) {
          yield child.toString(largeIndentation)
        }
      },
    })
  }
}
