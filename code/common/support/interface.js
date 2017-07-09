const { repr } = require('common/support/strings')
const { CoolError } = require('common/errors')

class InterfaceNotImplementedError extends CoolError {}

class Interface {
    static methods(...methods) {
        return new this(methods.map(method => ({ name: method, iface: Interface.IFunction })))
    }

    static create(props) {
        return new this(Object.entries(props).map(([name, iface]) => ({ name, iface })))
    }

    constructor(props) {
        for (const iface of props) {
            Interface.IObject.assert(iface)
            Interface.IString.assert(iface.name)
            Interface.IInterface.assert(iface.iface)
        }

        this.props = props
    }

    assert(instance) {
        if (!(instance instanceof Interface.IObject))
            throw new InterfaceNotImplementedError(`${repr(instance)} must be an object`)

        for (const { name, iface } of this.props)
            if (!(name in instance && instance[name] instanceof iface))
                throw new InterfaceNotImplementedError(`${repr(instance)} does not implement ${repr(iface)} ${name}`)

        return instance
    }

    [Symbol.hasInstance](instance) {
        if (!(instance instanceof Interface.IObject))
            return false

        for (const { name, iface } of this.props)
            if (!(name in instance && instance[name] instanceof iface))
                return false

        return true
    }
}

Object.defineProperty(Interface, 'InterfaceNotImplementedError', { value: InterfaceNotImplementedError })

/* eslint-disable no-unused-vars */
Object.defineProperty(Interface, 'IEmpty', {
    value: {
        assert(instance) {
            return instance
        },

        [Symbol.hasInstance](instance) {
            return true
        },

        toString() {
            return 'string'
        }
    }
})
/* eslint-enable no-unused-vars */

Object.defineProperty(Interface, 'IString', {
    value: {
        assert(instance) {
            if (!(instance instanceof this))
                throw new InterfaceNotImplementedError(`${repr(instance)} must be a string`)

            return instance
        },

        [Symbol.hasInstance](instance) {
            return typeof instance === 'string'
        },

        toString() {
            return 'string'
        }
    }
})

Object.defineProperty(Interface, 'INumber', {
    value: {
        assert(instance) {
            if (!(instance instanceof this))
                throw new InterfaceNotImplementedError(`${repr(instance)} must be a number`)

            return instance
        },

        [Symbol.hasInstance](instance) {
            return typeof instance === 'number'
        },

        toString() {
            return 'number'
        }
    }
})

Object.defineProperty(Interface, 'IBoolean', {
    value: {
        assert(instance) {
            if (!(instance instanceof this))
                throw new InterfaceNotImplementedError(`${repr(instance)} must be a boolean`)

            return instance
        },

        [Symbol.hasInstance](instance) {
            return typeof instance === 'boolean'
        },

        toString() {
            return 'boolean'
        }
    }
})

Object.defineProperty(Interface, 'IUndefined', {
    value: {
        assert(instance) {
            if (!(instance instanceof this))
                throw new InterfaceNotImplementedError(`${repr(instance)} must be undefined`)

            return instance
        },

        [Symbol.hasInstance](instance) {
            return typeof instance === 'undefined'
        },

        toString() {
            return 'undefined'
        }
    }
})

Object.defineProperty(Interface, 'INull', {
    value: {
        assert(instance) {
            if (!(instance instanceof this))
                throw new InterfaceNotImplementedError(`${repr(instance)} must be null`)

            return instance
        },

        [Symbol.hasInstance](instance) {
            return instance === null
        },

        toString() {
            return 'null'
        }
    }
})

Object.defineProperty(Interface, 'ISymbol', {
    value: {
        assert(instance) {
            if (!(instance instanceof this))
                throw new InterfaceNotImplementedError(`${repr(instance)} must be null`)

            return instance
        },

        [Symbol.hasInstance](instance) {
            return instance === null
        },

        toString() {
            return 'Symbol'
        }
    }
})

Object.defineProperty(Interface, 'IFunction', {
    value: {
        assert(instance) {
            if (!(instance instanceof this))
                throw new InterfaceNotImplementedError(`${repr(instance)} must be a function`)

            return instance
        },

        [Symbol.hasInstance](instance) {
            return typeof instance === 'function'
        },

        toString() {
            return 'function'
        }
    }
})

Object.defineProperty(Interface, 'IObject', {
    value: {
        assert(instance) {
            if (!(instance instanceof this))
                throw new InterfaceNotImplementedError(`${repr(instance)} must be an object`)

            return instance
        },

        [Symbol.hasInstance](instance) {
            return typeof instance === 'function' || typeof instance === 'object' && instance !== null
        },

        toString() {
            return 'Object'
        }
    }
})

Object.defineProperty(Interface, 'IArray', {
    value: {
        assert(instance) {
            if (!(instance instanceof this))
                throw new InterfaceNotImplementedError(`${repr(instance)} must be an array`)

            return instance
        },

        [Symbol.hasInstance](instance) {
            return Object.prototype.toString.call(instance) === '[object Array]'
        },

        toString() {
            return 'Array'
        }
    }
})

Object.defineProperty(Interface, 'IInterface', {
    value: {
        assert(instance) {
            Interface.IObject.assert(instance)

            if (!(instance instanceof this))
                throw new InterfaceNotImplementedError(`${repr(instance)} must be implement the hasInstance hook`)

            return instance
        },

        [Symbol.hasInstance](instance) {
            return instance instanceof Interface.IObject &&
                Symbol.hasInstance in instance &&
                instance[Symbol.hasInstance] instanceof Interface.IFunction
        },

        toString() {
            return 'Interface'
        }
    }
})

module.exports = Interface
