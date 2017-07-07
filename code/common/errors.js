class CoolError extends Error {
    static assert(value, message) {
        if (!value)
            throw new this(message)
    }
}

class HTTPError extends CoolError {
    constructor(code, message, viewID) {
        super(message)
        this.code = code
        this.message = message

        if (viewID)
            this.viewID = viewID
    }

    toString() {
        return `HTTP Error ${this.code}: ${this.message}`
    }
}

module.exports = {
    CoolError,
    HTTPError,

    NotFoundError: class NotFoundError extends HTTPError {
        constructor(viewID) {
            super(404, 'Resource not found', viewID)
        }
    }
}
