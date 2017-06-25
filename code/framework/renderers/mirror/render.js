const overloader = require('common/support/overloader');

const AbstractXMLComponent = require('framework/components/xml');
const TextComponent = require('framework/components/text');
const FactoryComponent = require('framework/components/factory');

const MirrorXMLRenderer = require('framework/renderers/mirror/xml');
const MirrorTextRenderer = require('framework/renderers/mirror/text');
const FactoryRenderer = require('framework/renderers/factory');

const render = overloader(
    {
        type: AbstractXMLComponent,
        impl(component) {
            return new MirrorXMLRenderer(component, render).render();
        }
    },

    {
        type: FactoryComponent,
        impl(component) {
            return new FactoryRenderer(component, render).render();
        }
    },

    {
        type: TextComponent,
        impl(component) {
            return new MirrorTextRenderer(component, render).render();
        }
    }
);

module.exports = render;
