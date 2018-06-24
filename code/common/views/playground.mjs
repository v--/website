import { c } from '../component'
import section from '../components/section'
import link from '../components/link'

export default function playground () {
  return c('div', { class: 'page playground-page' },
    c(section, { title: '/playground' },
      c('ul', null,
        c('li', null,
          c(link, {
            class: 'playground-link',
            text: 'Sorting visualizations',
            link: 'playground/sorting',
            isInternal: true
          })
        )
      )
    )
  )
}
