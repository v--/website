const c = require('common/component');

module.exports = class Renderer {
    constructor(component) {
        if (component instanceof Function)
            this.component = c(component);
        else
            this.component = component;
    }

    renderComponent() {
        throw new Error('Not implemented');
    }

    renderFactory() {
        return new this.constructor(this.component.type({
            options: this.component.options,
            contents: this.component.contents
        })).render();
    }

    render() {
        if (this.component.type instanceof Function)
            return this.renderFactory();

        return this.renderComponent();
    }
};
