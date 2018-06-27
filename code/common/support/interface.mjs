import { repr } from './strings'
import { CoolError } from '../errors'

export class InterfaceNotImplementedError extends CoolError {}

export default class Interface {
  static or (...interfaces) {
    for (const iface of interfaces) {
      IInterface.assert(iface)
    }

    return {
      assert (instance) {
        if (!(instance instanceof this)) {
          throw new InterfaceNotImplementedError(`${repr(instance)} must be one of ${repr(interfaces)}`)
        }

        return instance
      },

      [Symbol.hasInstance] (instance) {
        return interfaces.some(function (iface) {
          return instance instanceof iface
        })
      }
    }
  }

  static methods (...methods) {
    return new this(methods.map(method => ({ name: method, iface: IFunction })))
  }

  static create (props) {
    return new this(Object.entries(props).map(([name, iface]) => ({ name, iface })))
  }

  constructor (props) {
    for (const iface of props) {
      IObject.assert(iface)
      IString.assert(iface.name)
      IInterface.assert(iface.iface)
    }

    this.props = props
  }

  assert (instance) {
    if (!(instance instanceof IObject)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be an object`)
    }

    for (const { name, iface } of this.props) {
      if (!(name in instance && instance[name] instanceof iface)) {
        throw new InterfaceNotImplementedError(`${repr(instance)} does not implement ${repr(iface)} ${name}`)
      }
    }

    return instance
  }

  [Symbol.hasInstance] (instance) {
    if (!(instance instanceof IObject)) {
      return false
    }

    for (const { name, iface } of this.props) {
      if (!(name in instance && instance[name] instanceof iface)) {
        return false
      }
    }

    return true
  }
}

/* eslint-disable no-unused-vars */
export const IEmpty = {
  assert (instance) {
    return instance
  },

  [Symbol.hasInstance] (instance) {
    return true
  },

  toString () {
    return 'nothing'
  }
}
/* eslint-enable no-unused-vars */

export const IString = {
  assert (instance) {
    if (!(instance instanceof this)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be a string`)
    }

    return instance
  },

  [Symbol.hasInstance] (instance) {
    return typeof instance === 'string'
  },

  toString () {
    return 'string'
  }
}

export const INumber = {
  assert (instance) {
    if (!(instance instanceof this)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be a number`)
    }

    return instance
  },

  [Symbol.hasInstance] (instance) {
    return typeof instance === 'number'
  },

  toString () {
    return 'number'
  }
}

export const IBoolean = {
  assert (instance) {
    if (!(instance instanceof this)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be a boolean`)
    }

    return instance
  },

  [Symbol.hasInstance] (instance) {
    return typeof instance === 'boolean'
  },

  toString () {
    return 'boolean'
  }
}

export const IUndefined = {
  assert (instance) {
    if (!(instance instanceof this)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be undefined`)
    }

    return instance
  },

  [Symbol.hasInstance] (instance) {
    return typeof instance === 'undefined'
  },

  toString () {
    return 'undefined'
  }
}

export const INull = {
  assert (instance) {
    if (!(instance instanceof this)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be null`)
    }

    return instance
  },

  [Symbol.hasInstance] (instance) {
    return instance === null
  },

  toString () {
    return 'null'
  }
}

export const ISymbol = {
  assert (instance) {
    if (!(instance instanceof this)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be null`)
    }

    return instance
  },

  [Symbol.hasInstance] (instance) {
    return instance === null
  },

  toString () {
    return 'Symbol'
  }
}

export const IFunction = {
  assert (instance) {
    if (!(instance instanceof this)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be a function`)
    }

    return instance
  },

  [Symbol.hasInstance] (instance) {
    return typeof instance === 'function'
  },

  toString () {
    return 'function'
  }
}

export const IObject = {
  assert (instance) {
    if (!(instance instanceof this)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be an object`)
    }

    return instance
  },

  [Symbol.hasInstance] (instance) {
    return typeof instance === 'function' || (typeof instance === 'object' && instance !== null)
  },

  toString () {
    return 'Object'
  }
}

export const IArray = {
  assert (instance) {
    if (!(instance instanceof this)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be an array`)
    }

    return instance
  },

  [Symbol.hasInstance] (instance) {
    return Object.prototype.toString.call(instance) === '[object Array]'
  },

  toString () {
    return 'Array'
  }
}

export const IInterface = {
  assert (instance) {
    IObject.assert(instance)

    if (!(instance instanceof this)) {
      throw new InterfaceNotImplementedError(`${repr(instance)} must be implement the hasInstance hook`)
    }

    return instance
  },

  [Symbol.hasInstance] (instance) {
    return instance instanceof IObject &&
            Symbol.hasInstance in instance &&
            instance[Symbol.hasInstance] instanceof IFunction
  },

  toString () {
    return 'Interface'
  }
}

export const IError = Interface.create({
  message: IString
})

export const IDisplayableError = Interface.create({
  title: IString,
  message: IString
})
