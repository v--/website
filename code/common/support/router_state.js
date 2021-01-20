import { ClientError, CoolError } from '../errors.js'
import { error as errorView } from '../views/error.js'
import { SidebarId } from '../enums/sidebar_id.js'
import { Path } from './path.js'

/**
 * @typedef {object} RouterStateParams
 * @property {string} title
 * @property {Path} path
 * @property {Components.FactoryComponentType<RouterState> | Playground.PlaygroundPage} factory
 * @property {any} [data]
 * @property {string} [description]
 * @property {boolean} [loading]
 * @property {SidebarId} [sidebarId]
 * @property {boolean} [isCollapsed]
 * @property {TypeCons.Action<MouseEvent>} [toggleCollapsed]
 */

/**
 * @implements RouterStateParams
 */
export class RouterState {
  /**
   * @param {Path} path
   * @param {Error} err
   */
  static error(path, err) {
    return new this({
      path,
      sidebarId: SidebarId.error,
      title: CoolError.isDisplayable(err) ? (/** @type {ClientError} */ (err)).title.toLowerCase() : 'error',
      description: 'An error has occurred.',
      factory: errorView,
      data: err
    })
  }

  /**
   * @param {RouterStateParams} payload
   */
  constructor({
    title,
    path,
    factory,
    data = undefined,
    description = '',
    loading = false,
    sidebarId = undefined,
    isCollapsed = false,
    toggleCollapsed = undefined
  }) {
    this.title = title
    this.path = path
    this.factory = factory
    this.data = data
    this.description = description
    this.loading = loading
    this.sidebarId = sidebarId
    this.isCollapsed  = isCollapsed
    this.toggleCollapsed  = toggleCollapsed
  }
}
