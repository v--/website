const Renderer = require('common/renderer');

module.exports = class ClientRenderer extends Renderer {
    rerender() {
        const parent = this.element.parentNode;
        const oldElement = this.element;
        const newElement = this.renderComponentImpl();
        parent.replaceChild(newElement, oldElement);
        this.element = newElement;
    }

    renderComponentImpl() {
        const element = document.createElement(this.component.type);

        for (const [key, value] of this.component.options)
            element.setAttribute(key, value);

        if (this.component.isVoid)
            return;

        for (const content of this.component.contents)
            if (typeof content === 'string')
                element.appendChild(document.createTextNode(content));
            else
                element.appendChild(new this.constructor(content).render());

        return element;
    }

    renderComponent() {
        this.component.options.listeners.add(this.rerender.bind(this));
        this.element = this.renderComponentImpl();
        return this.element;
    }
};
