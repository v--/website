import { ClientError, CoolError } from '../errors.js'
import { error as errorView } from '../views/error.js'
import { Path } from './path.js'

/**
 * @param {Path} path
 * @param {unknown} err
 * @returns {TRouter.IRouterStatePartial}
 */
export function createErrorState(path, err) {
  const error = err instanceof Error ? err : new ClientError()

  return {
    path,
    sidebarId: 'error',
    title: CoolError.isDisplayable(error) ? (/** @type {ClientError} */ (err)).title.toLowerCase() : 'error',
    description: 'An error has occurred.',
    factory: errorView,
    data: err
  }
}
