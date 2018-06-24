import { HTTPError, ClientError } from '../errors'
import Interface, { IFunction, IString, IEmpty } from './interface'

import error from '../views/error'

const IRouterState = Interface.create({
  factory: IFunction,
  id: IString,
  title: IString,
  dataURL: IEmpty,
  data: IEmpty,
  loading: IEmpty
})

export default class RouterState {
  static error (path, err) {
    return new this({
      path,
      id: err.viewID || 'error',
      title: err instanceof HTTPError || err instanceof ClientError ? err.title.toLowerCase() : 'error',
      factory: error,
      dataURL: null,
      data: err
    })
  }

  constructor (rawState) {
    IFunction.assert(rawState.factory)

    Object.assign(this, {
      title: rawState.id,
      dataURL: null,
      data: null,
      loading: false
    }, rawState)

    IRouterState.assert(this)
  }
}
