const overloader = require('common/support/overloader');
const ActualSet = require('common/support/actual_set');
const { chain } = require('common/support/itertools');

const { FactoryComponent, XMLComponent } = require('common/component');

const renderCache = new WeakMap();

function *groupComponents(newComponents, oldComponents) {
    let matchedComponentCount = 0;

    for (let i = 0; i < Math.min(newComponents.length, oldComponents.length); i++)
        for (let j = matchedComponentCount; j < newComponents.length; j++)
            if (newComponents[i].type === oldComponents[j].type) {
                matchedComponentCount++;
                yield [newComponents[i], oldComponents[j]];
            }
}

function rerenderXMLComponent(newComponent, oldComponent) {
    let state = renderCache.get(newComponent);

    if (!state) {
        state = renderCache.get(oldComponent);
        renderCache.delete(oldComponent);
        renderCache.set(newComponent, state);
    }

    state.rendered = newComponent.dup();

    if (newComponent.type !== oldComponent.type) {
        const newElement = render(newComponent);
        state.element.parentNode.replaceChild(newElement, state.element);
        return;
    }

    const pendingUpdate = chain(
        newComponent.options.updated(oldComponent.options),
        newComponent.options.diff(oldComponent.options)
    );

    for (const key of pendingUpdate) {
        const value = newComponent.options.get(key);

        if (value instanceof Function)
            state.element.removeEventListener(key, value);
        else
            state.element.setAttribute(key, value);
    }

    for (const key of oldComponent.options.diff(newComponent.options)) {
        const value = newComponent.options.get(key);

        if (value instanceof Function)
            state.element.removeEventListener(key, value);
        else
            state.element.removeAttribute(key);
    }

    const processedNewChildren = new ActualSet();
    const processedOldChildren = new ActualSet();

    for (const [newChild, oldChild] of groupComponents(newComponent.children, oldComponent.children)) {
        processedNewChildren.add(newChild);
        processedOldChildren.add(oldChild);

        rerenderXMLComponent(newChild, oldChild);
    }

    for (const child of newComponent.children)
        if (!processedNewChildren.has(child))
            state.element.appendChild(render(child));

    for (const child of oldComponent.children)
        if (!processedOldChildren.has(child))
            state.element.removeChild(child);
}

const rerenderDispatcher = overloader(
    {
        type: FactoryComponent,
        impl(component) {
            const state = renderCache.get(component);

            if (component.equals(state.rendered))
                return;

            const newRoot = component.evaluate();
            rerenderXMLComponent(newRoot, state.root);
            state.root = newRoot;
        }
    },

    {
        type: XMLComponent,
        impl(component) {
            const state = renderCache.get(component);

            if (component.equals(state.rendered))
                return;

            rerenderXMLComponent(component, state.rendered);
        }
    }
);

function renderComponent(component) {
    const element = document.createElementNS(component.namespace, component.type);

    for (const [key, value] of component.options)
        if (value instanceof Function)
            element.addEventListener(key, value);
        else
            element.setAttribute(key, value);

    for (const child of component.children)
        if (typeof child === 'string')
            element.appendChild(document.createTextNode(child));
        else
            element.appendChild(render(child));

    return element;
}

function render(component) {
    const state = { rendered: component.dup() };
    const rerender = rerenderDispatcher.bind(null, component);
    component.options.listeners.add(rerender);

    state.detatch = function () {
        component.options.listeners.delete(rerender);
    };

    if (component instanceof FactoryComponent)
        state.element = render(state.root = component.evaluate());
    else
        state.element = renderComponent(component);

    renderCache.set(component, state);
    return state.element;
}

module.exports = render;
