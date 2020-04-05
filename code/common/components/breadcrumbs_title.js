import { c } from '../rendering/component.js'

import { link } from './link.js'
import { icon } from './icon.js'
import { classlist } from '../support/dom_properties.js'
import { cumulative, last } from '../support/iteration.js'

export function breadcrumbsTitle ({ class: className, path, root }) {
  const cumSegments = Array.from(cumulative(path.segments.slice(0, -1))).reverse()

  return c('h1', { class: classlist('breadcrumbs-title', 'h1', className) },
    path.underCooked === root
      ? c('div', { class: 'up-link', title: 'Already at topmost level' },
        c(icon, { name: 'upload' })
      )
      : c(link, { class: 'up-link', title: 'Go one level up', link: path.getParentPath().cooked, isInternal: true },
        c(icon, { name: 'upload' })
      ),

    c('div', { class: 'breadcrumbs' },
      c('div', { class: 'breadcrumb' },
        c(icon, { name: 'chevron-left' }),
        c('span', { text: last(path.segments) })
      ),
      ...cumSegments.map(segments => {
        const lastSegment = last(segments)
        return c('div', { class: 'breadcrumb' },
          c(icon, { name: 'chevron-left' }),
          c(link, { link: '/' + segments.join('/'), isInternal: true, title: lastSegment, text: lastSegment })
        )
      })
    )
  )
}
