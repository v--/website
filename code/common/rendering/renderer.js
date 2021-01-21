import { repr } from '../support/strings.js'
import { chain, uniqueBy } from '../support/iteration.js'
import { CoolError, NotImplementedError } from '../errors.js'
import { Subject } from '../observables/subject.js'
import { FactoryComponent, XMLComponent } from './component.js'

export class RenderError extends CoolError {}

/**
 * @template NodeType
 * @implements TRendering.IRenderer<NodeType>
 */
export class Renderer {

  /**
   * @param {TComponents.IComponent} component
   * @param {TRendering.IRenderDispatcher<NodeType>} dispatcher
   */
  constructor(component, dispatcher) {
    this.component = component
    this.dispatcher = dispatcher

    if (this.dispatcher.cache.has(component)) {
      throw new RenderError(`${component} has already been rendered`)
    }

    this.dispatcher.cache.set(component, this)

    /** @type {TObservables.IPotentialObserver<TComponents.ComponentStateType | undefined>} */
    this.observer = this.rerender.bind(this)


    /** @type {TComponents.ComponentStateType | undefined} */
    this.oldState = undefined
  }

  /**
   * @returns {NodeType}
   */
  render() {
    throw new NotImplementedError()
  }

  /**
   * @returns {void}
   */
  rerender() {
    throw new NotImplementedError()
  }

  destroy() {} // eslint-disable-line @typescript-eslint/no-empty-function
}

/**
 * @template NodeType
 * @extends Renderer<NodeType>
 */
export class XMLRenderer extends Renderer {
  /**
   * @param {XMLComponent} component
   * @param {TRendering.IRenderDispatcher<NodeType>} dispatcher
   * @param {TRendering.INodeManipulator<NodeType>} manipulator
   */
  constructor(component, dispatcher, manipulator) {
    super(component, dispatcher)
    this.component = component
    this.dispatcher = dispatcher
    this.manipulator = manipulator
  }

  render() {
    const component = this.component
    const state = component.state.value

    this.element = this.manipulator.createNode(component)

    if (state !== undefined) {
      for (const [key, value] of Object.entries(state)) {
        if (key !== 'text') {
          this.manipulator.setAttribute(this.element, key, value)
        }
      }

      if ('text' in state) {
        this.manipulator.setText(this.element, state.text)
      }
    }

    for (const child of component.children) {
      this.manipulator.appendChild(this.element, this.dispatcher.render(child))
    }

    component.state.subscribe(this.observer)
    this.dispatcher.events.create.next({
      component: this.component,
      element: this.element
    })

    return this.element
  }

  /**
   * @param {TComponents.ComponentStateType} oldState
   * @param {TComponents.ComponentStateType} newState
   */
  updateAttributes(oldState, newState) {
    const oldKeys = new Set(oldState === undefined ? [] : Object.keys(oldState))
    const newKeys = new Set(newState === undefined ? [] : Object.keys(newState))
    const keys = Array.from(uniqueBy(chain(oldKeys, newKeys)))
    const element = /** @type {NodeType} */ (this.element)

    for (const key of keys) {
      if (oldKeys.has(key) && newKeys.has(key)) {
        if (oldState[key] !== newState[key]) {
          if (key === 'text') {
            this.manipulator.setText(element, newState[key])
          } else {
            this.manipulator.setAttribute(element, key, newState[key], oldState[key])
          }
        }
      } else if (oldKeys.has(key)) {
        if (key === 'text') {
          this.manipulator.removeText(element)
        } else {
          this.manipulator.removeAttribute(element, key, oldState[key])
        }
      } else if (newKeys.has(key)) {
        if (key === 'text') {
          this.manipulator.setText(element, newState[key])
        } else {
          this.manipulator.setAttribute(element, key, newState[key])
        }
      }
    }
  }

  rerender() {
    if (!this.dispatcher.cache.has(this.component)) {
      throw new RenderError(`${repr(this.component)} cannot be rerendered without being rendered first`)
    }

    const newState = this.component.state.value

    if (this.oldState) {
      this.updateAttributes(this.oldState, newState)
    }

    this.oldState = newState
  }

  destroy() {
    this.component.unsubscribeFromStateSource()

    for (const child of this.component.children) {
      const renderer = this.dispatcher.cache.get(child)

      if (renderer) {
        renderer.destroy()
      }
    }
  }
}

/**
 * @param {TComponents.IComponent[]} oldChildren
 * @param {TComponents.IComponent[]} newChildren
 */
function * mergeChildren(oldChildren, newChildren) {
  for (let i = 0; i < Math.min(oldChildren.length, newChildren.length); i++) {
    const oldChild = oldChildren[i]
    const newChild = newChildren[i]

    if (oldChild.constructor === newChild.constructor && oldChild.type === newChild.type) {
      yield { action: 'update', i }
    } else {
      yield { action: 'replace', i }
    }
  }

  for (let i = oldChildren.length; i < newChildren.length; i++) {
    yield { action: 'append', i }
  }

  for (let i = newChildren.length; i < oldChildren.length; i++) {
    yield { action: 'remove', i }
  }
}

/**
 * @template NodeType
 * @extends Renderer<NodeType>
 */
export class FactoryRenderer extends Renderer {
  /**
   * @param {FactoryComponent} component
   * @param {TRendering.IRenderDispatcher<NodeType>} dispatcher
   */
  constructor(component, dispatcher) {
    super(component, dispatcher)
    this.component = component

    /** @type {TComponents.IComponent | undefined} */
    this.root = undefined
  }

  render() {
    this.root = this.component.evaluate()
    this.element = this.dispatcher.render(this.root)
    this.component.state.subscribe(this.observer)

    this.dispatcher.events.create.next({
      component: this.component,
      element: this.element
    })

    return this.element
  }

  /**
   * @param {TComponents.IComponent} oldRoot
   * @param {TComponents.IComponent} newRoot
   */
  rerenderChildren(oldRoot, newRoot) {
    const rootRenderer = this.dispatcher.cache.get(oldRoot)

    /** @type {Set<TNum.UInt32>} */
    const added = new Set()
    /** @type {Set<TNum.UInt32>} */
    const removed = new Set()
    /** @type {Set<TNum.UInt32>} */
    const replaced = new Set()

    for (const { i, action } of Array.from(mergeChildren(oldRoot.children, newRoot.children))) {
      switch (action) {
        case 'append': {
          added.add(i)
          break
        }

        case 'update': {
          const oldChild = oldRoot.children[i]
          const newChild = newRoot.children[i]

          if (oldChild.stateSource !== newChild.stateSource) {
            oldChild.updateStateSource(newChild.stateSource)
          }

          this.rerenderChildren(oldChild, newChild)
          const oldRenderer = this.dispatcher.cache.get(oldChild)
          // Some of the nested children may have been updated
          oldRenderer.rerender()
          break
        }

        case 'replace': {
          replaced.add(i)
          break
        }

        case 'remove': {
          removed.add(i)
          break
        }
      }
    }

    for (const i of added) {
      const newChild = newRoot.children[i]

      if (rootRenderer instanceof XMLRenderer) {
        this.dispatcher.render(newRoot.children[i])
        const newRenderer = this.dispatcher.cache.get(newChild)

        rootRenderer.manipulator.appendChild(
          rootRenderer.element,
          newRenderer.element
        )
      }

      oldRoot.children.push(newChild)
    }

    for (const i of replaced) {
      const oldRenderer = this.dispatcher.cache.get(oldRoot.children[i])
      const newChild = newRoot.children[i]

      if (rootRenderer instanceof XMLRenderer) {
        this.dispatcher.render(newChild)
        const newRenderer = this.dispatcher.cache.get(newChild)

        rootRenderer.manipulator.replaceChild(
          rootRenderer.element,
          oldRenderer.element,
          newRenderer.element
        )
      }

      oldRoot.children[i] = newChild
      oldRenderer.destroy()
    }

    for (const i of removed) {
      const oldRenderer = this.dispatcher.cache.get(oldRoot.children[i])

      if (rootRenderer instanceof XMLRenderer) {
        rootRenderer.manipulator.removeChild(
          rootRenderer.element,
          oldRenderer.element
        )
      }

      oldRenderer.destroy()
    }

    oldRoot.children = oldRoot.children.filter((_child, i) => !removed.has(i))
  }

  rerender() {
    if (!this.dispatcher.cache.has(this.component)) {
      throw new RenderError(`${repr(this.component)} cannot be rerendered without being rendered first`)
    }

    if (!this.root || !this.dispatcher.cache.has(this.root)) {
      throw new RenderError(`${repr(this.root)} cannot be rerendered without being rendered first`)
    }

    const oldRoot = this.root
    const newRoot = this.component.evaluate()

    if (newRoot.constructor !== oldRoot.constructor || newRoot.type !== oldRoot.type) {
      throw new RenderError(`${repr(this.component)} evaluated ${repr(newRoot)}, but expected a ${repr(oldRoot.constructor)} with type ${repr(oldRoot.type)}`)
    }

    this.rerenderChildren(oldRoot, newRoot)
    oldRoot.updateStateSource(newRoot.stateSource)
  }

  destroy() {
    this.component.unsubscribeFromStateSource()

    this.dispatcher.events.destroy.next({
      component: this.component,
      element: this.element
    })

    const renderer = this.dispatcher.cache.get(/** @type {TComponents.IComponent} */ (this.root))

    if (renderer) {
      renderer.destroy()
    }
  }
}

/**
 * @template NodeType
 * @implements TRendering.IRenderDispatcher<NodeType>
 */
export class RenderDispatcher {
  /**
   * @template NodeType
   * @param {TRendering.INodeManipulator<NodeType>} manipulator
   */
  static fromManipulator(manipulator) {
    return new RenderDispatcher(
      /** @type {TRendering.RenderingFunction<XMLComponent, NodeType>} */
      (component, dispatcher) =>
        new XMLRenderer(component, dispatcher, manipulator).render(),

      /** @type {TRendering.RenderingFunction<FactoryComponent, NodeType>} */
      (component, dispatcher) =>
        new FactoryRenderer(component, dispatcher).render()
    )
  }

  /**
   * @param {TRendering.RenderingFunction<XMLComponent, NodeType>} xmlComponentFactory
   * @param {TRendering.RenderingFunction<FactoryComponent, NodeType>} factoryComponentFactory
   */
  constructor(xmlComponentFactory, factoryComponentFactory) {
    this.xmlComponentFactory = xmlComponentFactory
    this.factoryComponentFactory = factoryComponentFactory

    this.cache = /** @type {TCons.NonStrictWeakMap<TComponents.IComponent, TRendering.IRenderer<NodeType>>} */ new WeakMap()

    this.events = {
      /** @type {TObservables.ISubject<TRendering.IRenderEvent<NodeType>>} */
      create: new Subject(),
      /** @type {TObservables.ISubject<TRendering.IRenderEvent<NodeType>>} */
      destroy: new Subject()
    }
  }

  /**
   * @param {TComponents.IComponent} component
   * @returns {NodeType}
   */
  render(component) {
    if (component instanceof XMLComponent) {
      return this.xmlComponentFactory(component, this)
    }

    if (component instanceof FactoryComponent) {
      return this.factoryComponentFactory(component, this)
    }

    throw new RenderError(`No renderer found for component ${repr(component)}`)
  }
}
