import { repr } from '../support/strings.js'
import { chain, uniqueBy } from '../support/iteration.js'
import { CoolError } from '../errors.js'
import { Subject } from '../observables/subject.js'
import { Component, ComponentState, FactoryComponent, XMLComponent } from './component.js'
import { PotentialObserver } from '../observables/observer.js'
import { Optional } from '../types/typecons.js'

export class RenderError extends CoolError {}

export interface RenderingFunction<ComponentType, NodeType> {
  (component: ComponentType, dispatcher: RenderDispatcher<NodeType>): NodeType
}

export abstract class Renderer<NodeType> {
  oldState?: ComponentState
  element?: NodeType
  observer: PotentialObserver<Optional<ComponentState>>

  abstract render(): NodeType
  abstract rerender(): void

  constructor(
    public component: Component,
    public dispatcher: RenderDispatcher<NodeType>
  ) {
    if (this.dispatcher.cache.has(component)) {
      throw new RenderError(`${component} has already been rendered`)
    }

    this.dispatcher.cache.set(component, this)
    this.observer = this.rerender.bind(this)
  }

  destroy() {} // eslint-disable-line @typescript-eslint/no-empty-function
}

export interface INodeManipulator<NodeType> {
  createNode(component: Component): NodeType
  setAttribute<T>(node: NodeType, key: string, value: T, oldValue?: T): void
  removeAttribute<T>(node: NodeType, key: string, oldValue?: T): void
  setText(node: NodeType, value: string): void
  removeText(node: NodeType): void
  appendChild(node: NodeType, child: NodeType): void
  replaceChild(node: NodeType, oldChild: NodeType, newChild: NodeType): void
  removeChild(node: NodeType, child: NodeType): void
}

export class XMLRenderer<NodeType> extends Renderer<NodeType> {
  constructor(
    public component: XMLComponent,
    public dispatcher: RenderDispatcher<NodeType>,
    public manipulator: INodeManipulator<NodeType>
  ) {
    super(component, dispatcher)
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
        this.manipulator.setText(this.element, state.text!)
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

    return this.element!
  }

  updateAttributes(oldState: ComponentState, newState: ComponentState) {
    const oldKeys = new Set(oldState === undefined ? [] : Object.keys(oldState))
    const newKeys = new Set(newState === undefined ? [] : Object.keys(newState))
    const keys = Array.from(uniqueBy(chain(oldKeys, newKeys)))
    const element = this.element!

    for (const key of keys) {
      if (oldKeys.has(key) && newKeys.has(key)) {
        if (oldState[key] !== newState[key]) {
          if (key === 'text') {
            this.manipulator.setText(element, newState[key]!)
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
          this.manipulator.setText(element, newState[key]!)
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

    const newState = this.component.state.value!

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

function * mergeChildren(oldChildren: Component[], newChildren: Component[]) {
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

export class FactoryRenderer<NodeType> extends Renderer<NodeType> {
  root?: Component

  constructor(
    public component: FactoryComponent,
    public dispatcher: RenderDispatcher<NodeType>
  ) {
    super(component, dispatcher)
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

  rerenderChildren(oldRoot: Component, newRoot: Component) {
    const rootRenderer = this.dispatcher.cache.get(oldRoot)
    const added = new Set<number>()
    const removed = new Set<number>()
    const replaced = new Set<number>()

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
          const newRenderer = this.dispatcher.cache.get(oldChild)!
          // Some of the nested children may have been updated
          newRenderer.rerender()
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
        const newRenderer = this.dispatcher.cache.get(newChild)!

        rootRenderer.manipulator.appendChild(
          rootRenderer.element,
          newRenderer.element
        )
      }

      oldRoot.children.push(newChild)
    }

    for (const i of replaced) {
      const oldRenderer = this.dispatcher.cache.get(oldRoot.children[i])!
      const newChild = newRoot.children[i]

      if (rootRenderer instanceof XMLRenderer) {
        this.dispatcher.render(newChild)
        const newRenderer = this.dispatcher.cache.get(newChild)!

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
      const oldRenderer = this.dispatcher.cache.get(oldRoot.children[i])!

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

    const renderer = this.dispatcher.cache.get(this.root!)

    if (renderer) {
      renderer.destroy()
    }
  }
}

export class RenderDispatcher<NodeType> {
  cache = new WeakMap<Component, Renderer<NodeType>>()
  events = {
    create: new Subject(),
    destroy: new Subject()
  }

  static fromRenderers<NodeType>(
    manipulator: INodeManipulator<NodeType>
  ) {
    return new RenderDispatcher<NodeType>(
      (component: XMLComponent, dispatcher: RenderDispatcher<NodeType>) =>
        new XMLRenderer(component, dispatcher, manipulator).render(),

      (component: FactoryComponent, dispatcher: RenderDispatcher<NodeType>) =>
        new FactoryRenderer(component, dispatcher).render()
    )
  }

  constructor(
    public xmlComponentFactory: RenderingFunction<XMLComponent, NodeType>,
    public factoryComponentFactory: RenderingFunction<FactoryComponent, NodeType>
  ) {}

  render(component: Component): NodeType {
    if (component instanceof XMLComponent) {
      return this.xmlComponentFactory(component, this)
    }

    if (component instanceof FactoryComponent) {
      return this.factoryComponentFactory(component, this)
    }

    throw new RenderError(`No renderer found for component ${repr(component)}`)
  }
}
