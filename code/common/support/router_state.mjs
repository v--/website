import { CoolError } from '../errors.mjs'
import errorView from '../views/error.mjs'
import { SidebarID, PageUpdateMode } from '../enums.mjs'

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

  constructor ({ title, path, factory, data = null, loading = false, sidebarID = null, pageUpdateMode = PageUpdateMode.NORMAL }) {
    this.data = data
    this.path = path
    this.title = title
    this.factory = factory
    this.loading = loading
    this.sidebarID = sidebarID
    this.pageUpdateMode = pageUpdateMode
  }
}
