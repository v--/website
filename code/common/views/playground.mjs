import { c } from '../component'
import section from '../components/section'
import link from '../components/link'
import markdown from '../components/markdown'

export default function playground () {
  return c('div', { class: 'page playground-page' },
    c(section, { title: '/playground' },
      c(markdown, {
        text: [
          'These are some JavaScript visualizations and simulations I have programmed across the years',
          '(there are actually more simulations, the others have not yet been ported to the latest version of the website).'
        ].join(' ')
      }),
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
