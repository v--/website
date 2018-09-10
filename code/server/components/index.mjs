import { c } from '../../common/rendering/component.mjs'

import nojs from '../../common/components/nojs.mjs'
import main from '../../common/components/main.mjs'
import title from '../../common/components/title.mjs'

export default function index ({ state }) {
  let serializedData

  if (state.data instanceof Error) {
    serializedData = JSON.stringify({
      path: state.path.cooked,
      error: state.data.toJSON ? state.data : { message: state.data.message }
    })
  } else {
    serializedData = JSON.stringify({
      path: state.path.cooked,
      data: state.data,
      dataURL: state.dataURL
    })
  }

  return c('html', { lang: 'en-US' },
    c('head', null,
      c(title, state),
      c('meta', { charset: 'UTF-8' }),
      c('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      c('base', { href: '/' }),
      c('link', { rel: 'shortcut icon', type: 'image/x-icon', href: 'images/favicon.png' }),
      c('link', { rel: 'stylesheet', href: 'styles/index.css' }),
      c('script', { id: 'data', type: 'application/json', text: serializedData }),
      c('script', { src: 'code/client/core/compatibility.mjs' }),
      c('script', { type: 'module', src: 'code/client/core/index.mjs' })
    ),

    c('body', null,
      c(nojs, state),
      c(main, state)
    )
  )
}
