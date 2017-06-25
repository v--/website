const overloader = require('common/support/overloader');

const AbstractXMLComponent = require('framework/components/xml');
const TextComponent = require('framework/components/text');
const FactoryComponent = require('framework/components/factory');

const render = overloader(
    {
        type: AbstractXMLComponent,
        *impl(component) {
            yield `<${component.type}`;

            for (const [key, value] of component.options)
                if (!(value instanceof Function))
                    yield ` ${key}="${value}"`;

            yield '>';

            if (component.isVoid)
                return;

            for (const child of component.children)
                yield* render(child);

            yield `</${component.type}>`;
        }
    },

    {
        type: FactoryComponent,
        *impl(component) {
            yield* render(component.evaluate());
        }
    },

    {
        type: TextComponent,
        *impl(component) {
            yield component.text;
        }
    }
);

module.exports = render;
