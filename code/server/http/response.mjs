import { chain } from '../../common/support/iteration.mjs'
import { c } from '../../common/rendering/component.mjs'

import index from '../components/index.mjs'
import interactivePlaceholder from '../../common/views/interactive_placeholder.mjs'

import dispatcher from '../render_dispatcher.mjs'

export default class Response {
  static json (contents, code) {
    return new this(JSON.stringify(contents), 'application/json', code)
  }

  static view (state, code) {
    const patchedState = Object.assign(
      { collapsed: false, redirect () {} },
      state
    )

    // Only interactive pages could possible require dynamic imports
    if (typeof patchedState.factory === 'string') {
      patchedState.factory = interactivePlaceholder
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
