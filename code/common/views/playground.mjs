import { c } from '../rendering/component.mjs'
import link from '../components/link.mjs'

export default function playground () {
  return c('div', { class: 'page playground-page' },
    c('div', { class: 'section' },
      c('h1', { class: 'section-title', text: '/playground' }),
      c('p', { text: "These are some of the JavaScript visualizations and simulations I have created. You can view their code in your browser's console." }),
      c('ul', null,
        c('li', null,
          c(link, {
            class: 'playground-link',
            text: 'Sorting visualizations',
            link: 'playground/sorting',
            isInternal: true
          })
        ),

        c('li', null,
          c(link, {
            class: 'playground-link',
            text: 'Curve fitting visualizations',
            link: 'playground/curve_fitting',
            isInternal: true
          })
        ),

        c('li', null,
          c(link, {
            class: 'playground-link',
            text: 'Affine iterated function system visualizations',
            link: 'playground/aifs',
            isInternal: true
          })
        )
      )
    )
  )
}
