import { chain } from '../../common/support/iteration.js'
import { c } from '../../common/rendering/component.js'

import { index } from '../components/index.js'
import { unsupported } from '../../common/views/unsupported.js'

import { dispatcher } from '../render_dispatcher.js'

export class Response {
  /**
   * @param {unknown} contents
   * @param {TNum.UInt32} [code]
   */
  static json(contents, code) {
    return new this(JSON.stringify(contents), 'application/json', code)
  }

  /**
   * @param {TRouter.IRouterResult} state
   * @param {TNum.UInt32} [code]
   */
  static view(state, code) {
    // Only interactive pages could possibly require dynamic imports
    /** @type {TRouter.IRouterResult} */
    const patchedState = {
      ...state,
      factory: typeof state.factory === 'string' ? unsupported : state.factory
    }

    const component = c(index, { state: patchedState })

    return new this(
      Array.from(chain('<!DOCTYPE html>', dispatcher.render(component))).join(''),
      'text/html',
      code
    )
  }

  /**
   * @param {string} content
   * @param {string} mimeType
   * @param {TNum.UInt32} code
   */
  constructor(content, mimeType, code = 200) {
    this.content = content
    this.mimeType = mimeType
    this.code = code
  }
}
