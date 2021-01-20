import { repr, join } from '../support/strings.js'
import { Observable } from '../observables/observable.js'
import { BehaviorSubject } from '../observables/behavior_subject.js'
import { CoolError } from '../errors.js'

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

/**
 * @param {Components.IPotentialComponent[]} children
 */
function * processChildren(children) {
  for (const child of children) {
    if (child instanceof Component) {
      yield child
    } else if (child) {
      throw new InvalidComponentError(`Expected either a component or falsy value as a child, but got ${repr(child)}`)
    }
  }
}

/**
 * @implements Components.IComponent
 */
export class Component {
  /**
   * @template T
   * @param {string | Components.FactoryComponentType<T>} type
   * @param {Components.IComponentStateSource<T>} [stateSource]
   * @param {Components.IPotentialComponent[]} children
   * @returns {Component}
   */
  static safeCreate(type, stateSource, ...children) {
    if (!(stateSource instanceof Object) && stateSource !== undefined) { 
      throw new ComponentCreationError(`Expected either an object or undefined as an state source, but got ${repr(stateSource)}`)
    }

    if (stateSource instanceof Component) {
      throw new ComponentCreationError(`To prevent common errors, components are not allowed as state sources (got ${repr(stateSource)})`)
    }

    const component = new this(type, stateSource, /** @type {Component[]} */(Array.from(processChildren(children))))
    component.checkSanity()
    return component
  }

  /**
   * @param {string | Components.FactoryComponentType<any>} type
   * @param {Components.IComponentStateSource} stateSource,
   * @param {Components.IComponent[]} children
   */
  constructor(type, stateSource, children) {
    this.type = type
    this.stateSource = stateSource
    this.children = children

    /** @type {BehaviorSubject<TypeCons.Optional<Components.ComponentStateType>>} */
    this.state = new BehaviorSubject(undefined)
    this.updateStateSource(stateSource)
  }

  /** @param {Components.ComponentStateType} newState */
  updateState(newState) {
    if (!(newState instanceof Object) && newState !== undefined) { 
      throw new ComponentSanityError(`${repr(this)}'s new state ${repr(newState)} must be undefined or an object`)
    }

    if (newState !== undefined && 'text' in newState && this.children.length > 0) {
      throw new ComponentSanityError(`${repr(this)} cannot have both text and children`)
    }

    this.state.next(newState)
  }

  unsubscribeFromStateSource() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe()
    }
  }

  /**
   * @param {Components.IComponentStateSource} newSource
   */
  updateStateSource(newSource) {
    this.unsubscribeFromStateSource()

    if (Observable.isObservable(newSource)) {
      this.stateSubscription = (/** @type {Observables.IObservable<Components.ComponentStateType>} */(newSource)).subscribe(newState => {
        this.stateSource = newSource
        this.updateState(/** @type {Components.ComponentStateType} */(newState))
      })
    } else {
      this.stateSource = newSource
      this.updateState(/** @type {Components.ComponentStateType} */ (newSource))
    }
  }

  /**
   * @returns {Generator<string>}
   */
  * iterToString() {
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

  /**
   * @returns {string}
   */
  toString() {
    return join('', this.iterToString())
  }

  /**
   * @param {Components.IComponent} other
   * @returns {boolean}
   */
  equals(other) {
    return String(this) === String(other)
  }

  /**
   * @returns {void}
   */
  checkSanity() {} // eslint-disable-line @typescript-eslint/no-empty-function
}

export class XMLComponent extends Component {
  /**
   * @param {string} type
   * @param {Components.IComponentStateSource} stateSource,
   * @param {Components.IComponent[]} children
   */
  constructor(type, stateSource, children) {
    super(type, stateSource, children)

    /** @type {string} */
    this.type = type

    /** @type {TypeCons.Optional<string>} */
    this.namespace = undefined
  }

  checkSanity() {
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

  /**
   * @param {string} type
   * @param {Components.IComponentStateSource} [stateSource]
   * @param {Components.IPotentialComponent[]} children
   * @returns {HTMLComponent}
   */
  static safeCreate(type, stateSource, ...children) {
    return /** @type {HTMLComponent} */(super.safeCreate(type, stateSource, ...children))
  }

  /**
   * @param {string} type
   * @param {Components.IComponentStateSource} stateSource,
   * @param {Components.IComponent[]} children
   */
  constructor(type, stateSource, children) {
    super(type, stateSource, children)

    /** @type {boolean} */
    this.isVoid = htmlVoidTags.has(this.type)
  }

  checkSanity() {
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
  /**
   * @template T
   * @param {Components.FactoryComponentType<T>} type
   * @param {Components.IComponentStateSource<T>} [stateSource]
   * @param {Components.IPotentialComponent[]} children
   * @returns {FactoryComponent}
   */
  static safeCreate(type, stateSource, ...children) {
    return /** @type {FactoryComponent} */(super.safeCreate(type, stateSource, ...children))
  }

  /**
   * @param {Components.FactoryComponentType<any>} type
   * @param {Components.IComponentStateSource<any>} stateSource,
   * @param {Components.IComponent[]} children
   */
  constructor(type, stateSource, children) {
    super(type, stateSource, children)

    /** @type {Components.FactoryComponentType<any>} type */
    this.type = type
  }

  checkSanity() {
    super.checkSanity()

    if (typeof this.type !== 'function') {
      throw new ComponentSanityError(`${repr(this)} must have a type function, not ${repr(this.type)}`)
    }
  }

  /**
   * @returns {Components.IComponent}
   */
  evaluate() {
    const component = this.type(this.state.value, this.children)

    if (!(component instanceof Component)) {
      throw new InvalidComponentError(`Expected ${repr(this)} to return a component, not ${repr(component)}.`)
    }

    return component
  }
}

/**
 * @template T
 * @param {string | Components.FactoryComponentType<T>} type
 * @param {Components.IComponentStateSource<T>} [stateSource]
 * @param {Components.IPotentialComponent[]} children
 * @returns {Component}
 */
export function c(type, stateSource, ...children) {
  switch (typeof type) {
    case 'string':
      return HTMLComponent.safeCreate(type, stateSource, ...children)

    case 'function':
      return FactoryComponent.safeCreate(type, stateSource, ...children)

    default:
      throw new InvalidComponentType(`${repr(type)} is not a valid component type.`)
  }
}
