class CoolError extends Error {
    static assert(value, message) {
        if (!value)
            throw new this(message)
    }
}

class HTTPError extends CoolError {
    constructor(code, message) {
        super(message)
        this.code = code
        this.message = message
    }

    toString() {
        return `HTTP Error ${this.code}: ${this.message}`
    }
}

module.exports = {
    CoolError,
    HTTPError,

    NotFoundError: class NotFoundError extends HTTPError {
        constructor() {
            super(404, 'Resource not found')
        }
    }
}
