import { PresentableError } from '../errors'
import { error as errorView } from '../views/error.js'
import { Path } from './path.js'

/**
 * @param {Path} path
 * @param {unknown} err
 * @returns {TRouter.IRouterStatePartial}
 */
export function createErrorState(path, err) {
  return {
    path,
    sidebarId: 'error',
    title: err instanceof PresentableError ? err.title.toLowerCase() : 'error',
    description: err instanceof PresentableError ? err.message : 'An error has occurred.',
    factory: errorView,
    data: err
  }
}
