import { ClientError } from '../errors.js'
import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'
import { QueryConfig } from '../support/query_config.js'

import { icon } from './icon.js'
import { link } from './link.js'

/**
 * @param {TNum.UInt32} pages
 * @param {QueryConfig<{ page: string }>} config
 */
function * iterPaginators(pages, config) {
  const currentPage = Number(config.get('page'))

  if (currentPage < 1 || (pages !== 0 && currentPage > pages)) {
    throw new ClientError(`Invalid page index ${currentPage} specified`)
  }

  yield c(link,
    {
      class: classlist('paginator paginator-prev', currentPage === 1 && 'disabled'),
      link: currentPage === 1 ? '' : config.getUpdatedPath({ page: String(currentPage - 1) }),
      isInternal: true
    },
    c(icon, {
      name: 'chevron-left'
    })
  )

  for (let i = 1; i <= pages; i++) {
    yield c(link,
      {
        class: classlist('paginator', currentPage === i && 'disabled'),
        link: config.getUpdatedPath({ page: String(i) }),
        isInternal: true
      },
      c('span', { text: String(i) })
    )
  }

  yield c(link,
    {
      disabled: currentPage === pages,
      class: classlist('paginator paginator-next', currentPage === pages && 'disabled'),
      link: currentPage === pages ? '' : config.getUpdatedPath({ page: String(currentPage + 1) }),
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
