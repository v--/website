const Renderer = require('framework/renderers/base')

module.exports = class FactoryRenderer extends Renderer {
    constructor(component, renderComponent) {
        super(component, renderComponent)
        this.boundRerender = this.rerender.bind(this)
        this.rendered = null
        this.rootComponent = null
    }

    render() {
        this.rootComponent = this.component.evaluate()
        this.element = this.renderComponent(this.rootComponent)
        this.rendered = this.component.dup()
        return this.element
    }

    rerender() {
    }

    destroy() {
        this.component.options.listeners.delete(this.boundRerender)
    }
}
