const { dup } = require('common/symbols')
const { overloader } = require('common/support/functools')
const { map } = require('common/support/itertools')
const { bind } = require('common/support/functools')
const { abstractMethodChecker } = require('common/support/classtools')
const { Component, XMLComponent, FactoryComponent, InvalidComponentError } = require('common/component')

class Renderer {
    constructor(dispatcher, component) {
        abstractMethodChecker(this.constructor, ['componentClass'])
        abstractMethodChecker(this, ['render', 'rerender'])
        this.boundRerender = bind(this, 'rerender')
        this.dispatcher = dispatcher
        this.component = component
        this.element = null
    }

    destroy() {}
}

class XMLRenderer extends Renderer {
    constructor(component, dispatcher) {
        super(component, dispatcher)
        abstractMethodChecker(this, ['_createNode', '_setOption', '_updateText', '_deleteOption', '_appendChild'])
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
            type: Cls.componentClass,
            impl: component => new Cls(dispather, component).render()
        }), renderers))

        return dispather
    }
}
