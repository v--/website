import { CoolError } from '../errors'
import { repr } from './strings'
import Interface, { IInterface } from './interface'

export function bind(object, methodName, ...args) {
    return object[methodName].bind(object, ...args)
}

export class MissingInterfaceError extends CoolError {}

export const IImplSpec = Interface.create({ iface: IInterface, impl: Function })

export function partial(func, ...args) {
    return func.bind(this, ...args)
}

export function overloader(...impls) {
    for (const impl of impls)
        IImplSpec.assert(impl)

    return function overloaded(primary, ...args) {
        for (const { iface, impl } of impls)
            if (primary instanceof iface)
                return impl(primary, ...args)

        throw new MissingInterfaceError(`No method matches ${repr(primary)}`)
    }
}
