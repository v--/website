import { c } from '../../common/component'

import nojs from '../../common/components/nojs'
import main from '../../common/components/main'
import title from '../../common/components/title'

export default function index ({ state }) {
  let serializedData

  if (state.data instanceof Error) {
    serializedData = JSON.stringify({
      path: state.path.cooked,
      errorCls: state.data.constructor.name,
      errorData: state.data
    })
  } else {
    serializedData = JSON.stringify({
      path: state.path.cooked,
      data: state.data,
      dataURL: state.dataURL
    })
  }

  const bundles = ['core']

  if (state.bundle) {
    bundles.push(state.bundle)
  }

  return c('html', { lang: 'en-US' },
    c('head', null,
      c(title, state),
      c('meta', { charset: 'UTF-8' }),
      c('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      c('base', { href: '/' }),
      c('link', { rel: 'shortcut icon', type: 'image/x-icon', href: 'images/favicon.png' }),
      ...bundles.map(function (bundle) {
        return c('link', { rel: 'stylesheet', href: `styles/${bundle}.css` })
      }),
      c('script', { id: 'data', type: 'application/json', text: serializedData }),
      ...bundles.map(function (bundle) {
        return c('script', { src: `code/${bundle}.js` })
      }),
      c('script', { src: 'code/compatibility.js' })
    ),

    c('body', null,
      c(nojs, state),
      c(main, state)
    )
  )
}
