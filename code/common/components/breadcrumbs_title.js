import { c } from '../rendering/component.js'

import { link } from './link.js'
import { icon } from './icon.js'
import { classlist } from '../support/dom_properties.js'
import { cumulative, last } from '../support/iteration.js'

export function breadcrumbsTitle ({ class: className, path, root }) {
  const cumSegments = Array.from(cumulative(path.segments.slice(0, -1))).reverse()
  const lastOverallSegment = last(path.segments)

  return c('h1', { class: classlist('breadcrumbs-title', 'h1', className) },
    path.underCooked === root
      ? c('div', { class: 'up-link', title: 'Already at topmost level' },
        c(icon, { name: 'upload' })
      )
      : c(link, { class: 'up-link', title: 'Go one level up', link: path.getParentPath().cooked, isInternal: true },
        c(icon, { name: 'upload' })
      ),

    cumSegments.length > 0 && c('div', { class: 'breadcrumbs' },
      ...cumSegments.map(segments => {
        const lastSegment = last(segments)
        return c('div', { class: classlist('breadcrumb', segments.length === 1 && 'first-breadcrumb') },
          c(link, { class: 'breadcrumb-text', text: lastSegment, title: lastSegment, link: '/' + segments.join('/'), isInternal: true }),
          c(icon, { name: 'chevron-left' })
        )
      })
    ),

    c('div', { class: classlist('breadcrumb', 'last-breadcrumb', cumSegments.length === 0 && 'first-breadcrumb') },
      c('span', { class: 'breadcrumb-text', text: lastOverallSegment, title: lastOverallSegment })
    )
  )
}
