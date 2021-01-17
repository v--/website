import { repr, join } from '../support/strings.js'
import { IObservable, Observable } from '../observables/observable.js'
import { BehaviorSubject } from '../observables/behavior_subject.js'
import { CoolError } from '../errors.js'
import { Subscription } from '../observables/subscription.js'
import { ObservableBase, Optional } from '../types/typecons.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentState<T = any> = T
export type FactoryComponentType<T> = (state: ObservableBase<T>, children: Component[]) => Component

export type PotentialComponent = Component | null | undefined | boolean | number | string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentStateSource<T = any> = ComponentState<T> | IObservable<ComponentState<T>>

const htmlVoidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
])

export class ComponentCreationError extends CoolError {}
export class ComponentSanityError extends ComponentCreationError {}
export class InvalidComponentType extends ComponentCreationError {}
export class InvalidComponentError extends CoolError {}

function * processChildren(children: PotentialComponent[]) {
  for (const child of children) {
    if (child instanceof Component) {
      yield child
    } else if (child) {
      throw new InvalidComponentError(`Expected either a component or falsy value as a child, but got ${repr(child)}`)
    }
  }
}

export class Component {
  private stateSubscription?: Subscription<ComponentState>
  state = new BehaviorSubject<Optional<ComponentState>>(undefined)

  /**
   * Do sanity checks before creating the actual component instance.
   */
  static safeCreate<T>(
    type: string | FactoryComponentType<ObservableBase<T>>,
    stateSource?: ComponentStateSource<ObservableBase<T>>,
    ...children: PotentialComponent[]
  ): Component {
    if (!(stateSource instanceof Object) && stateSource !== undefined) { 
      throw new ComponentCreationError(`Expected either an object or undefined as an state source, but got ${repr(stateSource)}`)
    }

    if (stateSource instanceof Component) {
      throw new ComponentCreationError(`To prevent common errors, components are not allowed as state sources (got ${repr(stateSource)})`)
    }

    const component = new this(type, stateSource, Array.from(processChildren(children)) as Component[])
    component.checkSanity()
    return component
  }

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public type: string | FactoryComponentType<any>,
    public stateSource: ComponentStateSource,
    public children: Component[]
  ) {
    this.updateStateSource(stateSource)
  }

  updateState(newState: ComponentState): void {
    if (!(newState instanceof Object) && newState !== undefined) { 
      throw new ComponentSanityError(`${repr(this)}'s new state ${repr(newState)} must be undefined or an object`)
    }

    if (newState !== undefined && 'text' in newState && this.children.length > 0) {
      throw new ComponentSanityError(`${repr(this)} cannot have both text and children`)
    }

    this.state.next(newState)
  }

  unsubscribeFromStateSource(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe()
    }
  }

  updateStateSource(newSource: ComponentStateSource): void {
    this.unsubscribeFromStateSource()

    if (Observable.isObservable(newSource)) {
      this.stateSubscription = (newSource as IObservable<ComponentState>).subscribe(newState => {
        this.stateSource = newSource
        this.updateState(newState as ComponentState)
      })
    } else {
      this.stateSource = newSource
      this.updateState(newSource as ComponentState)
    }
  }

  * iterToString(): Generator<string> {
    yield repr(this.constructor)
    yield '('
    yield repr(this.type)
    yield ', '
    yield repr(this.state.value)

    for (const child of this.children) {
      yield `,\n\t${String(child).replace(/\n/g, '\n\t')}`
    }

    if (this.children.length > 0) {
      yield '\n'
    }

    yield ')'
  }

  toString(): string {
    return join('', this.iterToString())
  }

  equals(other: Component): boolean {
    return String(this) === String(other)
  }

  checkSanity(): void {} // eslint-disable-line @typescript-eslint/no-empty-function
}

export abstract class XMLComponent extends Component {
  abstract namespace: string

  constructor(
    public type: string,
    public stateSource: ComponentStateSource,
    public children: Component[]
  ) {
    super(type, stateSource, children)
  }

  checkSanity(): void {
    super.checkSanity()

    if (typeof this.type !== 'string') {
      throw new ComponentSanityError(`${repr(this)} must have a string type, not ${repr(this.type)}`)
    }

    if (this.type.length === 0) {
      throw new ComponentSanityError(`${repr(this)}'s type string cannot be empty`)
    }

    if (!(this.state.value instanceof Object) && this.state.value !== undefined) { 
      throw new ComponentSanityError(`${repr(this)}'s state must be undefined an object`)
    }

    if (this.state.value !== undefined && 'text' in this.state.value && this.children.length > 0) {
      throw new ComponentSanityError(`${repr(this)} cannot have both text and children`)
    }

    if (typeof this.namespace !== 'string') {
      throw new ComponentSanityError(`${repr(this.namespace)} is not a valid namespace`)
    }
  }
}

export class HTMLComponent extends XMLComponent {
  namespace = 'http://www.w3.org/1999/xhtml'
  isVoid: boolean

  static safeCreate(type: string, stateSource?: ComponentStateSource, ...children: PotentialComponent[]): HTMLComponent {
    return super.safeCreate(type, stateSource, ...children) as HTMLComponent
  }

  constructor(
    public type: string,
    public stateSource: ComponentStateSource,
    public children: Component[]
  ) {
    super(type, stateSource, children)
    this.isVoid = htmlVoidTags.has(type)
  }

  checkSanity(): void {
    super.checkSanity()

    if (this.isVoid && this.children.length > 0) {
      throw new ComponentSanityError(`${repr(this)} cannot have children`)
    }

    if (this.isVoid && this.state.value && 'text' in this.state.value) {
      throw new ComponentSanityError(`${repr(this)} cannot have text`)
    }
  }
}

export class FactoryComponent extends Component {
  static safeCreate<T>(
    type: FactoryComponentType<ObservableBase<T>>,
    state: ObservableBase<T>,
    ...children: PotentialComponent[]
  ): FactoryComponent {
    return super.safeCreate(type, state, ...children) as FactoryComponent
  }

  constructor(
    public type: FactoryComponentType<unknown>,
    public stateSource: ComponentStateSource,
    public children: Component[]
  ) {
    super(type, stateSource, children)
  }

  checkSanity(): void {
    super.checkSanity()

    if (typeof this.type !== 'function') {
      throw new ComponentSanityError(`${repr(this)} must have a type function, not ${repr(this.type)}`)
    }
  }

  evaluate(): Component {
    const component = this.type(this.state.value, this.children)

    if (!(component instanceof Component)) {
      throw new InvalidComponentError(`Expected ${repr(this)} to return a component, not ${repr(component)}.`)
    }

    return component
  }
}

export function c<T>(
  type: string,
  stateSource?: ComponentStateSource,
  ...children: PotentialComponent[]
): Component 
export function c<T>(
  type: FactoryComponentType<ObservableBase<T>>,
  stateSource: ComponentStateSource<ObservableBase<T>>,
  ...children: PotentialComponent[]
): Component
export function c(
  type: string | FactoryComponentType<unknown>,
  stateSource?: ComponentStateSource<unknown>,
  ...children: PotentialComponent[]
) {
  switch (typeof type) {
    case 'string':
      return HTMLComponent.safeCreate(type, stateSource, ...children)

    case 'function':
      return FactoryComponent.safeCreate(type, stateSource, ...children)

    default:
      throw new InvalidComponentType(`${repr(type)} is not a valid component type.`)
  }
}
