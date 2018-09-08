import { repr } from '../support/strings.mjs'
import { chain, unique } from '../support/iteration.mjs'
import { Observable } from '../support/observable.mjs'
import { CoolError } from '../errors.mjs'

export class RenderError extends CoolError {}

export class Renderer {
  constructor (component, dispatcher) {
    this.dispatcher = dispatcher
    this.component = component

    if (this.dispatcher.cache.has(component)) {
      throw new RenderError(`${component} has already been rendered`)
    }

    this.dispatcher.cache.set(component, this)

    this.element = null
    this.observer = {
      next: newState => this.rerender(newState),
      complete () {},
      error (error) {
        throw error
      }
    }
  }

  destroy () {
    this.dispatcher.cache.remove(this.component)
  }
}

export class XMLRenderer extends Renderer {
  render () {
    const component = this.component
    const state = component.state.current

    this.element = this._createNode()

    for (const [key, value] of Object.entries(state)) {
      if (key !== 'text') {
        this._setAttribute(key, value)
      }
    }

    if ('text' in state) {
      this._setText(state.text)
    }

    for (const child of component.children) {
      this._appendChild(this.dispatcher.render(child))
    }

    component.state.subscribe(this.observer)
    this.dispatcher.observables.create.emit({
      component: this.component,
      element: this.element
    })

    return this.element
  }

  updateAttributes (oldState, newState) {
    const keys = unique(chain(Object.keys(oldState), Object.keys(newState)))

    for (const key of keys) {
      if (key in oldState && key in newState) {
        if (oldState[key] !== newState[key]) {
          if (key === 'text') {
            this._setText(newState[key])
          } else {
            this._setAttribute(key, newState[key], oldState[key])
          }
        }
      } else if (key in oldState) {
        if (key === 'text') {
          this._removeText()
        } else {
          this._removeAttribute(key, oldState[key])
        }
      } else if (key in newState) {
        if (key === 'text') {
          this._setText(newState[key])
        } else {
          this._setAttribute(key, newState[key])
        }
      }
    }
  }

  rerender (newState) {
    if (!this.dispatcher.cache.has(this.component)) {
      throw new RenderError(`${repr(this.component)} cannot be rerendered without being rendered first`)
    }

    const oldState = this.component.state.current
    this.component.updateState(newState)
    this.updateAttributes(oldState, newState)
  }

  destroy () {
    this.component.state.unsubscribe(this.observer)

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

    this.dispatcher.observables.create.emit({
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
          const oldRenderer = this.dispatcher.cache.get(oldChild)

          this.rerenderChildren(oldChild, newChild)
          oldRenderer.rerender(newChild.state.current)
          break
        }

        case 'replace': {
          const oldChild = oldRoot.children[i]
          const newChild = newRoot.children[i]

          newChild.state.updateSource(oldChild.state.source)
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

  rerender (newState) {
    this.component.updateState(newState)

    if (!this.dispatcher.cache.has(this.component)) {
      throw new RenderError(`${repr(this.component)} cannot be rerendered without being rendered first`)
    }

    if (!this.dispatcher.cache.has(this.root)) {
      throw new RenderError(`${repr(this.root)} cannot be rerendered without being rendered first`)
    }

    const oldRoot = this.root
    const newRoot = this.component.evaluate()

    if (newRoot.constructor !== oldRoot.constructor || newRoot.type !== oldRoot.type) {
      throw new RenderError(`${repr(this.component)} evaluated ${repr(newRoot)}, but expected a ${repr(oldRoot.constructor)} with type ${repr(oldRoot.type)}`)
    }

    const rootRenderer = this.dispatcher.cache.get(oldRoot)
    oldRoot.state.updateSource(newRoot.state.source)
    this.rerenderChildren(oldRoot, newRoot)
    rootRenderer.rerender(newRoot.state.current)
  }

  destroy () {
    this.component.state.unsubscribe(this.observer)

    this.dispatcher.observables.destroy.emit({
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
    this.observables = {
      create: new Observable(),
      destroy: new Observable()
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
