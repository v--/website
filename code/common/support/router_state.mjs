import Interface, { IString, IEmpty, IDisplayableError } from './interface'

import error from '../views/error'

const IRouterState = Interface.create({
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
      title: err instanceof IDisplayableError ? err.title.toLowerCase() : 'error',
      factory: error,
      dataURL: null,
      data: err
    })
  }

  constructor (rawState) {
    Object.assign(this, {
      title: rawState.id,
      dataURL: null,
      data: null,
      loading: false
    }, rawState)

    IRouterState.assert(this)
  }
}
