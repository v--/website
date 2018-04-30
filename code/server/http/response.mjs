import { chain } from '../../common/support/iteration'
import { c } from '../../common/component'

import index from '../components/index'

import StringBufferStream from '../support/string_buffer_stream'
import render from '../render'

export default class Response {
  static json (contents, code) {
    const stream = new StringBufferStream([JSON.stringify(contents)])
    return new this(stream, 'application/json', code)
  }

  static view (state, code) {
    const component = c(index, {
      state: Object.assign({ collapsed: false, redirect () {} }, state)
    })

    return new this(
      new StringBufferStream(chain('<!DOCTYPE html>', render(component))),
      'text/html',
      code
    )
  }

  constructor (stream, mimeType, code = 200) {
    this.stream = stream
    this.mimeType = mimeType
    this.code = code
  }
}
