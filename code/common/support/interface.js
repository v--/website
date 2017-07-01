const { all } = require('common/support/itertools')
const { repr } = require('common/support/strtools')
const { CoolError } = require('common/errors')

class InterfaceNotImplementedError extends CoolError {}

class Interface {
    static create(...props) {
        return new this(props)
    }

    constructor(props) {
        this.props = props
    }

    assert(instance) {
        if (!(instance instanceof Object))
            throw new InterfaceNotImplementedError(`${repr(instance)} must be an object`)

        for (const propName of this.props)
            if (!(propName in instance))
                throw new InterfaceNotImplementedError(`${repr(instance)} did not implement ${propName}`)
    }

    [Symbol.hasInstance](instance) {
        if (instance instanceof Object)
            return all(prop => prop in instance, this.props)

        return false
    }
}

Object.defineProperty(Interface, 'InterfaceNotImplementedError', { value: InterfaceNotImplementedError })
Object.defineProperty(Interface, 'IEmpty', { value: Interface.create() })
Object.defineProperty(Interface, 'IInterface', { value: Interface.create('assert', Symbol.hasInstance) })

module.exports = Interface
