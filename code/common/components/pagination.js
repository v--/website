import { BadRequestError } from '../errors'
import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'
import { QueryConfig } from '../support/query_config.js'

import { icon } from './icon.js'
import { anchor } from './anchor.js'

const PAGE_RANGE = 4

/**
 * @param {TNum.UInt32} pages
 * @param {QueryConfig<{ page: string }>} config
 */
function * iterPaginators(pages, config) {
  const currentPage = Number(config.get('page'))

  if (currentPage < 1 || (pages !== 0 && currentPage > pages)) {
    throw new BadRequestError(`Invalid page index ${currentPage} specified`)
  }

  yield c(anchor,
    {
      class: classlist('paginator paginator-prev', currentPage === 1 && 'disabled'),
      href: currentPage === 1 ? '' : config.getUpdatedPath({ page: String(currentPage - 1) }),
      isInternal: true
    },
    c(icon, {
      name: 'solid/chevron-left'
    })
  )

  let lowerBound = 1
  let upperBound = pages

  if (pages > 2 * PAGE_RANGE) {
    if (currentPage <= PAGE_RANGE) {
      upperBound = 2 * PAGE_RANGE + 1
    } else if (currentPage >= pages - PAGE_RANGE) {
      lowerBound = pages - 2 * PAGE_RANGE
    } else {
      lowerBound = currentPage - PAGE_RANGE
      upperBound = currentPage + PAGE_RANGE
    }
  }

  for (let i = lowerBound; i <= upperBound; i++) {
    yield c(anchor,
      {
        class: classlist('paginator', currentPage === i && 'disabled'),
        href: config.getUpdatedPath({ page: String(i) }),
        isInternal: true
      },
      c('span', { text: String(i) })
    )
  }

  yield c(anchor,
    {
      disabled: currentPage === pages,
      class: classlist('paginator paginator-next', currentPage === pages && 'disabled'),
      href: currentPage === pages ? '' : config.getUpdatedPath({ page: String(currentPage + 1) }),
      isInternal: true
    },
    c(icon, {
      name: 'solid/chevron-right'
    })
  )
}

/**
 * @param {{
    pages: TNum.UInt32,
    config: QueryConfig<{ page: string}>
  }} status
 */
export function pagination({ pages, config }) {
  return c('div', { class: 'pagination' },
    ...iterPaginators(pages, config)
  )
}
