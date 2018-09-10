import { CoolError } from '../errors.mjs'
import errorView from '../views/error.mjs'

export default class RouterState {
  static error (path, err) {
    return new this({
      path,
      id: 'error',
      title: CoolError.isDisplayable(err) ? err.title.toLowerCase() : 'error',
      factory: errorView,
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
  }
}
