const Renderer = require('common/renderer');

module.exports = class ClientRenderer extends Renderer {
    get db() {
        return {
            async getIcons() {
                return await fetch('api/icons').then(res => res.json());
            }
        };
    }

    constructor(component) {
        super(component);

        Object.defineProperty(this, 'rerender', {
            value: this.rerenderImpl.bind(this)
        });
    }

    createElement() {
        if (this.component.isSVG)
            return document.createElementNS('http://www.w3.org/2000/svg', this.component.type);

        return document.createElement(this.component.type);
    }

    async rerenderImpl() {
        const parent = this.element.parentNode;
        const oldElement = this.element;
        const newElement = await this.render();
        parent.replaceChild(newElement, oldElement);
        this.element = newElement;
    }

    async renderComponentImpl() {
        const element = this.createElement();

        for (const [key, value] of this.component.options)
            if (value instanceof Function)
                element.addEventListener(key, value);
            else
                element.setAttribute(key, value);

        if (this.component.isVoid)
            return element;

        for (const child of this.component.children)
            if (typeof child === 'string')
                element.appendChild(document.createTextNode(child));
            else
                element.appendChild(await new this.constructor(child).render());

        return element;
    }

    async renderComponent() {
        this.component.options.listeners.add(this.rerender);
        this.element = await this.renderComponentImpl();
        return this.element;
    }

    async renderFactory() {
        this.component.options.listeners.add(this.rerender);
        this.element = await super.renderFactory();
        return this.element;
    }

    detatch() {
        this.component.options.listeners.delete(this.rerender);
    }
};
