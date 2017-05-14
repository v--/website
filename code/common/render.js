const { Component, FactoryComponent } = require('common/component');
const { NotImplementedError } = require('common/errors');

module.exports = class Renderer {
    constructor(component) {
        if (component instanceof Function)
            this.component = new FactoryComponent(component);
        else if (component instanceof Component)
            this.component = component;
        else
            throw new NotImplementedError(`Invalid component: ${component}.`);
    }

    get db() {
        throw new NotImplementedError();
    }

    async renderComponent() {
        throw new NotImplementedError();
    }

    async renderFactory() {
        return new this.constructor(await this.component.type({
            db: this.db,
            options: this.component.options,
            children: this.component.children
        })).render();
    }

    async render() {
        if (this.component.type instanceof Function)
            return this.renderFactory();

        return this.renderComponent();
    }
};
