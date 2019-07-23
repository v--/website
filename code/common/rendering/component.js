import { repr, join } from '../support/strings.js'
import Observable from '../observables/observable.js'
import BehaviorSubject from '../observables/behavior_subject.js'
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

function * processChildren (children) {
  for (const child of children) {
    if (child instanceof Component) {
      yield child
    } else if (child) {
      throw new InvalidComponentError(`Expected either a component or falsy value as a child, but got ${repr(child)}`)
    }
  }
}

export class Component {
  /**
   * Do sanity checks before creating the actual component instance.
   */
  static safeCreate (type, ...args) {
    const stateSource = args.length === 0 ? null : args.shift()
    const children = Array.from(processChildren(args))

    if (typeof stateSource !== 'object') { // Yes, null too
      throw new ComponentCreationError(`Expected either an object or null as an state source, but got ${repr(stateSource)}`)
    }

    if (stateSource instanceof Component) {
      throw new ComponentCreationError(`To prevent common errors, components are not allowed as state sources (got ${repr(stateSource)})`)
    }

    const component = new this(type, stateSource, children)
    component.checkSanity()
    return component
  }

  constructor (type, stateSource, children) {
    this.type = type
    this.state = new BehaviorSubject(null)
    this._stateSubscription = null
    this.children = children

    this.updateStateSource(stateSource)
  }

  updateState (newState) {
    if (typeof newState !== 'object') { // Yes, null too
      throw new ComponentSanityError(`${repr(this)}'s new state ${repr(newState)} must be null or an object`)
    }

    if (newState !== null && 'text' in newState && this.children.length > 0) {
      throw new ComponentSanityError(`${repr(this)} cannot have both text and children`)
    }

    this.state.next(newState)
  }

  unsubscribeFromStateSource () {
    if (this._stateSubscription) {
      this._stateSubscription.unsubscribe()
    }
  }

  updateStateSource (newSource) {
    this.unsubscribeFromStateSource()

    if (Observable.isObservable(newSource)) {
      this._stateSubscription = newSource.subscribe(function (newState) {
        this.updateState(newState)
      }.bind(this))
    } else {
      this.updateState(newSource)
    }

    this.stateSource = newSource
  }

  * iterToString () {
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

  toString () {
    return join('', this.iterToString())
  }

  checkSanity () {}
}

export class XMLComponent extends Component {
  checkSanity () {
    super.checkSanity()

    if (typeof this.type !== 'string') {
      throw new ComponentSanityError(`${repr(this)} must have a string type, not ${repr(this.type)}`)
    }

    if (this.type.length === 0) {
      throw new ComponentSanityError(`${repr(this)}'s type string cannot be empty`)
    }

    if (typeof this.state.value !== 'object') { // Yes, null too
      throw new ComponentSanityError(`${repr(this)}'s state must be an object`)
    }

    if (this.state.value !== null && 'text' in this.state.value && this.children.length > 0) {
      throw new ComponentSanityError(`${repr(this)} cannot have both text and children`)
    }

    if (typeof this.namespace !== 'string') {
      throw new ComponentSanityError(`${repr(this.namespace)} is not a valid namespace`)
    }
  }
}

export class HTMLComponent extends XMLComponent {
  checkSanity () {
    super.checkSanity()

    if (this.isVoid && this.children.length > 0) {
      throw new ComponentSanityError(`${repr(this)} cannot have children`)
    }

    if (this.isVoid && this.state.value !== null && 'text' in this.state.value) {
      throw new ComponentSanityError(`${repr(this)} cannot have text`)
    }
  }

  constructor (...args) {
    super(...args)
    this.isVoid = htmlVoidTags.has(this.type)
  }
}

Object.defineProperty(HTMLComponent.prototype, 'namespace', { value: 'http://www.w3.org/1999/xhtml' })

export class FactoryComponent extends Component {
  checkSanity () {
    super.checkSanity()

    if (typeof this.type !== 'function') {
      throw new ComponentSanityError(`${repr(this)} must have a type function, not ${repr(this.type)}`)
    }
  }

  evaluate () {
    const component = this.type(this.state.value, this.children)

    if (!(component instanceof Component)) {
      throw new InvalidComponentError(`Expected ${this} to return a component, not ${repr(component)}.`)
    }

    return component
  }
}

export function c (type, ...args) {
  switch (typeof type) {
    case 'string':
      return HTMLComponent.safeCreate(type, ...args)

    case 'function':
      return FactoryComponent.safeCreate(type, ...args)

    default:
      throw new InvalidComponentType(`${repr(type)} is not a valid component type.`)
  }
}
