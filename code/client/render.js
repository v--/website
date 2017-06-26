const overloader = require('common/support/overloader')

const AbstractXMLComponent = require('framework/components/xml')
const TextComponent = require('framework/components/text')
const FactoryComponent = require('framework/components/factory')

const DOMXMLRenderer = require('client/renderers/xml')
const DOMTextRenderer = require('client/renderers/text')
const FactoryRenderer = require('framework/renderers/factory')

const render = overloader(
    {
        type: AbstractXMLComponent,
        impl(component) {
            return new DOMXMLRenderer(component, render).render()
        }
    },

    {
        type: FactoryComponent,
        impl(component) {
            return new FactoryRenderer(component, render).render()
        }
    },

    {
        type: TextComponent,
        impl(component) {
            return new DOMTextRenderer(component, render).render()
        }
    }
)

module.exports = render
