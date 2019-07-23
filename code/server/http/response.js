import { chain } from '../../common/support/iteration.js'
import { c } from '../../common/rendering/component.js'

import index from '../components/index.js'
import unsupported from '../../common/views/unsupported.js'

import dispatcher from '../render_dispatcher.js'

export default class Response {
  static json (contents, code) {
    return new this(JSON.stringify(contents), 'application/json', code)
  }

  static view (state, code) {
    const patchedState = Object.assign(
      { collapsed: false },
      state
    )

    // Only interactive pages could possibly require dynamic imports
    if (typeof patchedState.factory === 'string') {
      patchedState.factory = unsupported
    }

    const component = c(index, { state: patchedState })

    return new this(
      Array.from(chain('<!DOCTYPE html>', dispatcher.render(component))).join(''),
      'text/html',
      code
    )
  }

  constructor (content, mimeType, code = 200) {
    this.content = content
    this.mimeType = mimeType
    this.code = code
  }
}
