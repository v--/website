const trivialConstructor = require('common/support/trivial_constructor');
const { CoolError } = require('common/errors');

class HTTPError extends CoolError {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    toString() {
        return `HTTP Error ${this.code}: ${this.message}`;
    }
}

module.exports = {
    HTTPError,

    NotFoundError: class NotFoundError extends HTTPError {
        constructor() {
            super(404, 'Resource Not Found');
        }
    },

    ServerError: class ServerError extends HTTPError {
        constructor() {
            super(500, 'Internal Server error');
        }
    },

    Response: class Response extends trivialConstructor('stream', 'size', 'mimeType') {}
};
