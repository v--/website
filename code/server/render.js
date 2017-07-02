const { overloader } = require('common/support/functools')
const Interface = require('common/support/interface')

const { Component, XMLComponent, FactoryComponent } = require('common/component')

const render = overloader(
    {
        iface: XMLComponent,
        *impl(component) {
            yield `<${component.type}`

            for (const [key, value] of Object.entries(component.state.current))
                if (key !== 'text' && !(value instanceof Interface.IFunction))
                    yield ` ${key}="${value}"`

            yield '>'

            if (component.isVoid)
                return

            if ('text' in component.state.current)
                yield component.state.current.text

            for (const child of component.children)
                if (child instanceof Component)
                    yield* render(child)

            yield `</${component.type}>`
        }
    },

    {
        iface: FactoryComponent,
        *impl(component) {
            yield* render(component.evaluate())
        }
    }
)

module.exports = render
