const { bind, overloader } = require('common/support/functools')
const { repr } = require('common/support/strtools')
const { map, chain, unique, zip } = require('common/support/itertools')
const Interface = require('common/support/interface')
const { XMLComponent, FactoryComponent } = require('common/component')
const { CoolError } = require('common/errors')

const IRendererClass = Interface.methods('componentClass')
const IRenderer = Interface.methods('render', 'rerender')

class RenderError extends CoolError {}

class Renderer {
    constructor(dispatcher, component) {
        IRendererClass.assert(this.constructor)
        IRenderer.assert(this)
        this.dispatcher = dispatcher
        this.component = component

        if (this.dispatcher.cache.has(component))
            throw new RenderError(`${component} has already been rendered`)

        this.dispatcher.cache.set(component, this)

        this.element = null
        this.observer = {
            next: bind(this, 'rerender'),
            complete() {},
            error(error) {
                throw error
            }
        }
    }

    destroy() {
        this.dispatcher.cache.remove(this.component)
    }
}

const IXMLRenderer = Interface.methods(
    '_createNode',
    '_setAttribute',
    '_removeAttribute',
    '_setText',
    '_removeText',
    '_appendChild',
    '_replaceChild',
    '_removeChild'
)

class XMLRenderer extends Renderer {
    constructor(component, dispatcher) {
        super(component, dispatcher)
        IXMLRenderer.assert(this)
    }

    render() {
        const component = this.component
        const state = component.state.current

        this.element = this._createNode()

        for (const [key, value] of Object.entries(state))
            if (key !== 'text')
                this._setAttribute(key, value)

        if ('text' in state)
            this._setText(state.text)

        for (const child of component.children)
            this._appendChild(this.dispatcher(child))

        component.state.subscribe(this.observer)
        return this.element
    }

    updateAttributes(oldState, newState) {
        const keys = unique(chain(Object.keys(oldState), Object.keys(newState)))

        for (const key of keys) {
            if (key in oldState && key in newState) {
                if (oldState[key] !== newState[key])
                    if (key === 'text')
                        this._setText(newState[key])
                    else
                        this._setAttribute(key, newState[key], oldState[key])
            } else if (key in oldState) {
                if (key === 'text')
                    this._removeText()
                else
                    this._removeAttribute(key, oldState[key])
            } else if (key in newState) {
                if (key === 'text')
                    this._setText(newState[key])
                else
                    this._setAttribute(key, newState[key])
            }
        }
    }

    rerender(newState) {
        if (!this.dispatcher.cache.has(this.component))
            throw new RenderError(`${repr(this.component)} cannot be rerendered without being rendered first`)

        const oldState = this.component.state.current
        this.component.updateState(newState)
        this.updateAttributes(oldState, newState)
    }

    destroy() {
        this.component.state.unsubscribe(this.observer)

        for (const child of this.component.children)
            this.dispatcher.cache.get(child).destroy()
    }
}

Object.defineProperty(XMLRenderer, 'componentClass', { value: XMLComponent })

function *mergeChildren(oldChildren, newChildren) {
    for (const [oldChild, newChild] of zip(oldChildren, newChildren)) {
        if (oldChild.constructor === newChild.constructor && oldChild.type === newChild.type)
            yield { action: 'update', oldChild, newChild }
        else
            yield { action: 'replace', oldChild, newChild }
    }

    for (let i = oldChildren.length; i < newChildren.length; i++)
        yield { action: 'append', newChild: newChildren[i] }

    for (let i = newChildren.length; i < oldChildren.length; i++)
        yield { action: 'remove', oldChild: oldChildren[i] }
}

class FactoryRenderer extends Renderer {
    constructor(component, dispatcher) {
        super(component, dispatcher)
        this.root = null
    }

    render() {
        this.root = this.component.evaluate()
        this.element = this.dispatcher(this.root)
        this.component.state.subscribe(this.observer)
        return this.element
    }

    rerenderChildren(oldRoot, newRoot) {
        const rootRenderer = this.dispatcher.cache.get(oldRoot)

        for (const { oldChild, newChild, action } of mergeChildren(oldRoot.children, newRoot.children)) {
            switch (action) {
            case 'append': {
                this.dispatcher(newChild)
                const newRenderer = this.dispatcher.cache.get(newChild)
                oldRoot.children.push(newRenderer.element)
                rootRenderer._appendChild(newRenderer.element)
                break
            }

            case 'update': {
                const oldRenderer = this.dispatcher.cache.get(oldChild)
                oldRenderer.rerender(newChild.state.current)

                if (oldRenderer instanceof XMLRenderer)
                    this.rerenderChildren(oldChild, newChild)

                break
            }

            case 'replace': {
                const oldRenderer = this.dispatcher.cache.get(oldChild)
                this.dispatcher(newChild)
                const newRenderer = this.dispatcher.cache.get(newChild)
                oldRoot.children[oldRoot.children.indexOf(oldChild)] = newRenderer.component
                rootRenderer._replaceChild(oldRenderer.element, newRenderer.element)
                oldRenderer.destroy()
                break
            }

            case 'remove': {
                const oldRenderer = this.dispatcher.cache.get(oldChild)
                rootRenderer._removeChild(oldRenderer.element)
                oldRenderer.destroy()
                break
            }
            }
        }
    }

    rerender(newState) {
        this.component.updateState(newState)

        if (!this.dispatcher.cache.has(this.component))
            throw new RenderError(`${repr(this.component)} cannot be rerendered without being rendered first`)

        if (!this.dispatcher.cache.has(this.root))
            throw new RenderError(`${repr(this.root)} cannot be rerendered without being rendered first`)

        const oldRoot = this.root
        const newRoot = this.component.evaluate()

        if (newRoot.constructor !== oldRoot.constructor || newRoot.type !== oldRoot.type)
            throw new RenderError(`${repr(this.component)} evaluated ${repr(newRoot)}, but expected a ${repr(oldRoot.constructor)} with type ${repr(oldRoot.type)}`)

        this.dispatcher.cache.get(oldRoot).rerender(newRoot.state.current)
        this.rerenderChildren(oldRoot, newRoot)
    }

    destroy() {
        this.component.state.unsubscribe(this.observer)
        this.dispatcher.cache.get(this.root).destroy()
    }
}

Object.defineProperty(FactoryRenderer, 'componentClass', { value: FactoryComponent })

module.exports = {
    Renderer,
    XMLRenderer,
    FactoryRenderer,

    RenderError,

    renderDispatcherFactory(...renderers) {
        const dispatcher = overloader(...map(Cls => ({
            iface: Cls.componentClass,
            impl: component => new Cls(dispatcher, component).render()
        }), renderers))

        dispatcher.cache = new WeakMap()
        return dispatcher
    }
}
