const { abstractMethodChecker } = require('common/support/classtools')
const { chain } = require('common/support/itertools')
const Renderer = require('framework/renderers/base')

module.exports = class AbstractXMLRenderer extends Renderer {
    constructor(component, renderComponent) {
        super(component, renderComponent)
        abstractMethodChecker(this, ['_createNode', '_setOption', '_deleteOption', '_appendChild'])
        this.boundRerender = this.rerender.bind(this)
    }

    render() {
        const component = this.component
        this.element = this._createNode()

        for (const [key, value] of component.options)
            this._setOption(key, value)

        for (const child of component.children)
            this._appendChild(this.renderComponent(child))

        component.options.listeners.add(this.boundRerender)
        return this.element
    }

    updateOptions() {
        const oldOptions = this.rendered.options
        const newOptions = this.component.options

        for (const key of oldOptions.diff(newOptions))
            this._deleteOption(key)

        for (const key of chain(newOptions.diff(oldOptions), newOptions.updated(oldOptions)))
            this._setOption(key, newOptions.get(key))
    }

    rerender() {
        // Don't rerender children because they probably don't depend on the component's options
        this.updateOptions()
    }

    destroy() {
        this.component.options.listeners.delete(this.boundRerender)
    }
}
