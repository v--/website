const AbstractComponent = require('framework/components/base');

module.exports = class TextComponent extends AbstractComponent {
    constructor(text) {
        super();
        this.text = text;
    }

    equals(other) {
        return this.text === other.text;
    }

    dup() {
        return new this.constructor(this.text);
    }
};
