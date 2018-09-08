import { CoolError } from '../errors'
import error from '../views/error'

export default class RouterState {
  static error (path, err) {
    return new this({
      path,
      id: err.viewID || 'error',
      title: CoolError.isDisplayable(err) ? err.title.toLowerCase() : 'error',
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
  }
}
