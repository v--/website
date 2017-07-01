const { dup } = require('common/symbols')
const { overloader } = require('common/support/functools')
const { map } = require('common/support/itertools')
const { bind } = require('common/support/functools')
const Interface = require('common/support/interface')
const { Component, XMLComponent, FactoryComponent, InvalidComponentError } = require('common/component')

const IRendererClass = Interface.methods('componentClass')
const IRenderer = Interface.methods('render', 'rerender')

class Renderer {
    constructor(dispatcher, component) {
        IRendererClass.assert(this.constructor)
        IRenderer.assert(this)
        this.boundRerender = bind(this, 'rerender')
        this.dispatcher = dispatcher
        this.component = component
        this.element = null
    }

    destroy() {}
}

const IXMLRenderer = Interface.methods('_createNode', '_setOption', '_updateText', '_deleteOption', '_appendChild')

class XMLRenderer extends Renderer {
    constructor(component, dispatcher) {
        super(component, dispatcher)
        IXMLRenderer.assert(this)
    }

    render() {
        const component = this.component
        this.element = this._createNode()

        for (const [key, value] of Object.entries(component.state))
            if (key !== 'text')
                this._setOption(key, value)

        if ('text' in this.component.state)
            this._updateText(this.component.state.text)

        for (const child of component.children)
            this._appendChild(this.dispatcher(child))

        return this.element
    }

    rerender() {
        // TODO: Implement
    }
}

Object.defineProperty(XMLRenderer, 'componentClass', { value: XMLComponent })

class FactoryRenderer extends Renderer {
    constructor(component, dispatcher) {
        super(component, dispatcher)
        this.boundRerender = this.rerender.bind(this)
        this.rendered = null
        this.root = null
    }

    render() {
        const root = this.component.evaluate(this.children)

        if (!(root instanceof Component))
            throw new InvalidComponentError(`${this.component.type.name} returned an invalid component: ${root}`)

        if (root instanceof FactoryComponent)
            throw new InvalidComponentError(`${this.component.type.name} returned a this.component.type component`)

        this.root = root
        this.element = this.dispatcher(root)
        this.rendered = this.component[dup]()
        return this.element
    }

    rerender() {
        // TODO: Implement
    }
}

Object.defineProperty(FactoryRenderer, 'componentClass', { value: FactoryComponent })

module.exports = {
    Renderer,
    XMLRenderer,
    FactoryRenderer,

    renderDispatcherFactory(...renderers) {
        const dispather = overloader(...map(Cls => ({
            iface: Cls.componentClass,
            impl: component => new Cls(dispather, component).render()
        }), renderers))

        return dispather
    }
}
