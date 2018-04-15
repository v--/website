import { HTTPError } from '../errors'
import Interface, { IFunction, IString, IEmpty } from './interface'

import error from '../views/error'

const IRouterState = Interface.create({
    factory: IFunction,
    id: IString,
    title: IString,
    data: IEmpty
})

export default class RouterState {
    static error(path, err) {
        return new this({
            path,
            id: err.viewID || 'error',
            title: err instanceof HTTPError ? err.message.toLowerCase() : 'error',
            factory: error,
            data: err
        })
    }

    constructor(rawState) {
        IFunction.assert(rawState.factory)

        Object.assign(this, {
            title: rawState.id,
            data: null
        }, rawState)

        IRouterState.assert(this)
    }
}
