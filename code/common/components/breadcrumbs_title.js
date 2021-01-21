import { c } from '../rendering/component.js'

import { anchor } from './anchor.js'
import { icon } from './icon.js'
import { classlist } from '../support/dom_properties.js'
import { cumulative, last } from '../support/iteration.js'

/**
 * @param {{
    class?: string,
    path: TRouter.IPath,
    root: string
  }} state
 */
export function breadcrumbsTitle({ class: className, path, root }) {
  const cumSegments = Array.from(cumulative(path.segments.slice(0, -1))).reverse()
  const lastOverallSegment = last(path.segments)

  return c('h1', { class: classlist('breadcrumbs-title', 'h1', className) },
    path.underCooked === root
      ? c('div', { class: 'up-link', title: 'Already at topmost level' },
        c(icon, { name: 'upload' })
      )
      : c(anchor, { class: 'up-link', title: 'Go one level up', href: path.getParentPath().cooked, isInternal: true },
        c(icon, { name: 'upload' })
      ),

    cumSegments.length > 0 && c('div', { class: 'breadcrumbs' },
      ...cumSegments.map(segments => {
        const lastSegment = last(segments)
        return c('div', { class: classlist('breadcrumb', segments.length === 1 && 'first-breadcrumb') },
          c('span', { class: 'breadcrumb-slash', text: '/' }),
          c(anchor, { class: 'breadcrumb-text', text: lastSegment, title: lastSegment, href: '/' + segments.join('/'), isInternal: true })
        )
      })
    ),

    c('div', { class: classlist('breadcrumb', 'last-breadcrumb', cumSegments.length === 0 && 'first-breadcrumb') },
      c('span', { class: 'breadcrumb-slash', text: '/' }),
      c('span', { class: 'breadcrumb-text', text: lastOverallSegment, title: lastOverallSegment })
    )
  )
}
