import { CoolError } from '../errors.js'
import errorView from '../views/error.js'
import SidebarID from '../enums/sidebar_id.js'

export default class RouterState {
  static error (path, err) {
    return new this({
      path,
      sidebarID: SidebarID.ERROR,
      title: CoolError.isDisplayable(err) ? err.title.toLowerCase() : 'error',
      factory: errorView,
      data: err
    })
  }

  constructor ({ title, path, factory, data = null, loading = false, sidebarID = null }) {
    this.data = data
    this.path = path
    this.title = title
    this.factory = factory
    this.loading = loading
    this.sidebarID = sidebarID
  }
}
