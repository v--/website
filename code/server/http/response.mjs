import { chain } from '../../common/support/iteration'
import { c } from '../../common/component'

import index from '../components/index'

import render from '../render'

export default class Response {
  static json (contents, code) {
    return new this(JSON.stringify(contents), 'application/json', code)
  }

  static view (state, code) {
    const component = c(index, {
      state: Object.assign({ collapsed: false, redirect () {} }, state)
    })

    return new this(
      Array.from(chain('<!DOCTYPE html>', render(component))).join(''),
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
