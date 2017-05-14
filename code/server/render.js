const overloader = require('common/support/overloader');

const { FactoryComponent, XMLComponent } = require('common/component');

const render = overloader(
    {
        type: FactoryComponent,
        impl(component) {
            return render(component.evaluate());
        }
    },

    {
        type: XMLComponent,
        *impl(component) {
            yield `<${component.type}`;

            for (const [key, value] of component.options)
                if (!(value instanceof Function))
                    yield ` ${key}="${value}"`;

            yield '>';

            if (component.isVoid)
                return;

            for (const child of component.children)
                if (typeof child === 'string')
                    yield child;
                else
                    yield* render(child);

            yield `</${component.type}>`;
        }
    }
);

module.exports = render;
