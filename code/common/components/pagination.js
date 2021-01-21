import { ClientError } from '../errors.js'
import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'
import { QueryConfig } from '../support/query_config.js'

import { icon } from './icon.js'
import { anchor } from './anchor.js'

/**
 * @param {TNum.UInt32} pages
 * @param {QueryConfig<{ page: string }>} config
 */
function * iterPaginators(pages, config) {
  const currentPage = Number(config.get('page'))

  if (currentPage < 1 || (pages !== 0 && currentPage > pages)) {
    throw new ClientError(`Invalid page index ${currentPage} specified`)
  }

  yield c(anchor,
    {
      class: classlist('paginator paginator-prev', currentPage === 1 && 'disabled'),
      href: currentPage === 1 ? '' : config.getUpdatedPath({ page: String(currentPage - 1) }),
      isInternal: true
    },
    c(icon, {
      name: 'chevron-left'
    })
  )

  for (let i = 1; i <= pages; i++) {
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
      name: 'chevron-left'
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
