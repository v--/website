import { repr } from '../support/strings.js'
import { chain, uniqueBy } from '../support/iteration.js'
import { CoolError } from '../errors.js'
import Subject from '../observables/subject.js'

export class RenderError extends CoolError {}

export class Renderer {
  constructor (component, dispatcher) {
    this.dispatcher = dispatcher
    this.component = component
    this.oldState = null

    if (this.dispatcher.cache.has(component)) {
      throw new RenderError(`${component} has already been rendered`)
    }

    this.dispatcher.cache.set(component, this)

    this.element = null
    this.observer = this.rerender.bind(this)
  }

  destroy () {
    this.dispatcher.cache.remove(this.component)
  }
}

export class XMLRenderer extends Renderer {
  render () {
    const component = this.component
    const state = component.state.value

    this.element = this._createNode()

    if (state !== null) {
      for (const [key, value] of Object.entries(state)) {
        if (key !== 'text') {
          this._setAttribute(key, value)
        }
      }

      if ('text' in state) {
        this._setText(state.text)
      }
    }

    for (const child of component.children) {
      this._appendChild(this.dispatcher.render(child))
    }

    component.state.subscribe(this.observer)
    this.dispatcher.events.create.next({
      component: this.component,
      element: this.element
    })

    return this.element
  }

  updateAttributes (oldState, newState) {
    const oldKeys = new Set(oldState === null ? [] : Object.keys(oldState))
    const newKeys = new Set(newState === null ? [] : Object.keys(newState))
    const keys = Array.from(uniqueBy(chain(oldKeys, newKeys)))

    for (const key of keys) {
      if (oldKeys.has(key) && newKeys.has(key)) {
        if (oldState[key] !== newState[key]) {
          if (key === 'text') {
            this._setText(newState[key])
          } else {
            this._setAttribute(key, newState[key], oldState[key])
          }
        }
      } else if (oldKeys.has(key)) {
        if (key === 'text') {
          this._removeText()
        } else {
          this._removeAttribute(key, oldState[key])
        }
      } else if (newKeys.has(key)) {
        if (key === 'text') {
          this._setText(newState[key])
        } else {
          this._setAttribute(key, newState[key])
        }
      }
    }
  }

  rerender () {
    if (!this.dispatcher.cache.has(this.component)) {
      throw new RenderError(`${repr(this.component)} cannot be rerendered without being rendered first`)
    }

    const newState = this.component.state.value
    this.updateAttributes(this.oldState, newState)
    this.oldState = newState
  }

  destroy () {
    this.component.unsubscribeFromStateSource()

    for (const child of this.component.children) {
      this.dispatcher.cache.get(child).destroy()
    }
  }
}

function * mergeChildren (oldChildren, newChildren) {
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

export class FactoryRenderer extends Renderer {
  constructor (component, dispatcher) {
    super(component, dispatcher)
    this.root = null
  }

  render () {
    this.root = this.component.evaluate()
    this.element = this.dispatcher.render(this.root)
    this.component.state.subscribe(this.observer)

    this.dispatcher.events.create.next({
      component: this.component,
      element: this.element
    })

    return this.element
  }

  rerenderChildren (oldRoot, newRoot) {
    const rootRenderer = this.dispatcher.cache.get(oldRoot)
    const added = new Set()
    const removed = new Set()
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

          this.rerenderChildren(oldChild, newChild)
          oldChild.updateStateSource(newChild.stateSource)
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
        rootRenderer._appendChild(newRenderer.element)
      }

      oldRoot.children.push(newChild)
    }

    for (const i of replaced) {
      const oldRenderer = this.dispatcher.cache.get(oldRoot.children[i])
      const newChild = newRoot.children[i]

      if (rootRenderer instanceof XMLRenderer) {
        this.dispatcher.render(newChild)
        const newRenderer = this.dispatcher.cache.get(newChild)
        rootRenderer._replaceChild(oldRenderer.element, newRenderer.element)
      }

      oldRoot.children[i] = newChild
      oldRenderer.destroy()
    }

    for (const i of removed) {
      const oldRenderer = this.dispatcher.cache.get(oldRoot.children[i])

      if (rootRenderer instanceof XMLRenderer) {
        rootRenderer._removeChild(oldRenderer.element)
      }

      oldRenderer.destroy()
    }

    oldRoot.children = oldRoot.children.filter((child, i) => !removed.has(i))
  }

  rerender () {
    if (!this.dispatcher.cache.has(this.component)) {
      throw new RenderError(`${repr(this.component)} cannot be rerendered without being rendered first`)
    }

    if (!this.dispatcher.cache.has(this.root)) {
      throw new RenderError(`${repr(this.root)} cannot be rerendered without being rendered first`)
    }

    // if (['files', 'pacman', 'main'].includes(this.component.type.name)) {
    //   console.log(this.component.state.value.data)
    // }

    const oldRoot = this.root
    const newRoot = this.component.evaluate()

    if (newRoot.constructor !== oldRoot.constructor || newRoot.type !== oldRoot.type) {
      throw new RenderError(`${repr(this.component)} evaluated ${repr(newRoot)}, but expected a ${repr(oldRoot.constructor)} with type ${repr(oldRoot.type)}`)
    }

    oldRoot.updateStateSource(newRoot.stateSource)
    this.rerenderChildren(oldRoot, newRoot)
  }

  destroy () {
    this.component.unsubscribeFromStateSource()

    this.dispatcher.events.destroy.next({
      component: this.component,
      element: this.element
    })

    this.dispatcher.cache.get(this.root).destroy()
  }
}

export class RenderDispatcher {
  static fromRenderers (renderers) {
    const renderingFunctions = new Map()

    for (const [ComponentCls, RendererCls] of renderers.entries()) {
      renderingFunctions.set(ComponentCls, function (component, dispatcher) {
        return new RendererCls(component, dispatcher).render()
      })
    }

    return new this(renderingFunctions)
  }

  constructor (renderingFunctions) {
    this.renderingFunctions = renderingFunctions
    this.cache = new WeakMap()
    this.events = {
      create: new Subject(),
      destroy: new Subject()
    }
  }

  render (component) {
    for (const [ComponentCls, renderFun] of this.renderingFunctions.entries()) {
      if (component instanceof ComponentCls) {
        return renderFun(component, this)
      }
    }

    throw new Error(`No renderer found for component ${repr(component)}`)
  }
}
