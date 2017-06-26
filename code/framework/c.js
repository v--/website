const { CoolError } = require('common/errors')
const overloader = require('common/support/overloader')
const ReactiveMap = require('common/support/reactive_map')

const Component = require('framework/components/base')
const TextComponent = require('framework/components/text')
const HTMLComponent = require('framework/components/html')
const FactoryComponent = require('framework/components/factory')

function *processChildren(children) {
    for (const child of children) {
        if (child instanceof Component)
            yield child
        else if (typeof child === 'string')
            yield new TextComponent(child)
        else if (child)
            throw new CoolError(`Invalid child ${child}. Children can only be components, strings or falsy values.`)
    }
}

function createComponent(klass, type, options = {}, ...children) {
    if (options === null)
        options = {}

    if (!(options instanceof ReactiveMap))
        options = ReactiveMap.fromObject(options)

    return new klass(type, options, Array.from(processChildren(children)))
}

const c = overloader(
    {
        type: 'string',
        impl: createComponent.bind(null, HTMLComponent)
    },

    {
        type: Function,
        impl: createComponent.bind(null, FactoryComponent)
    }
)

c.createComponent = createComponent

module.exports = c
