import { HTTPError } from '../errors'
import { splitURL } from './strings'
import Interface, { IFunction, IString, IEmpty } from './interface'

import error from '../views/error'

const IRouterState = Interface.create({
    factory: IFunction,
    id: IString,
    title: IString,
    route: IString,
    subroute: IString,
    data: IEmpty
})

export default class RouterState {
    static error(url, err) {
        const { route, subroute } = splitURL(url)

        return new this({
            route, subroute,
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
