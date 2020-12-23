import { chain } from '../../common/support/iteration.js'
import { c } from '../../common/rendering/component.js'

import { index } from '../components/index.js'
import { unsupported } from '../../common/views/unsupported.js'

import { dispatcher } from '../render_dispatcher.js'
import { RouterState } from '../../common/support/router_state.js'

export class Response {
  static json(contents: unknown, code?: number) {
    return new this(JSON.stringify(contents), 'application/json', code)
  }

  static view(state: RouterState, code?: number) {
    // Only interactive pages could possibly require dynamic imports
    const patchedState: RouterState = {
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

  constructor(
    public content: string,
    public mimeType: string,
    public code: number = 200
  ) { }
}
