const { overloader } = require('common/support/functools')

const { Component, XMLComponent, FactoryComponent } = require('common/component')

const render = overloader(
    {
        type: XMLComponent,
        *impl(component) {
            yield `<${component.type}`

            for (const [key, value] of Object.entries(component.state))
                if (key !== 'text' && !(value instanceof Function))
                    yield ` ${key}="${value}"`

            yield '>'

            if (component.isVoid)
                return

            if (component.state.text)
                yield component.state.text

            for (const child of component.children)
                if (child instanceof Component)
                    yield* render(child)

            yield `</${component.type}>`
        }
    },

    {
        type: FactoryComponent,
        *impl(component) {
            yield* render(component.evaluate())
        }
    }
)

module.exports = render
