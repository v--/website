import { c } from '../../common/rendering/component.js'

import { main } from '../../common/components/main.js'
import { title } from '../../common/components/title'

/**
 * @param {{ state: TRouter.IRouterStatePartial }} componentState
 */
export function index({ state }) {
  let serializedData

  if (state.data instanceof Error) {
    serializedData = JSON.stringify({
      errorData: 'toJSON' in state.data ? state.data : { message: state.data.message }
    })
  } else {
    serializedData = JSON.stringify({
      data: state.data
    })
  }

  return c('html', { lang: 'en-US' },
    c('head', undefined,
      c(title, state),
      c('meta', { charset: 'UTF-8' }),
      c('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      c('meta', { name: 'description', content: state.description + '.' }),
      c('link', { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.png' }),
      // If on home page, preload photo
      state.path.segments.length === 0 && c('link', { rel: 'preload', as: 'image', href: '/images/me_irl.jpg' }),
      c('link', { rel: 'stylesheet', href: '/styles/core/index.css' }),
      c('script', { id: 'data', type: 'application/json', text: serializedData }),
      c('script', { src: '/code/client/preload.js' }),
      c('script', { type: 'module', src: '/code/client/core/index.js' })
    ),

    c('body', undefined,
      c(main, state)
    )
  )
}
