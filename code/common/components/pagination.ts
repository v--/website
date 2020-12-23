import { c } from '../rendering/component.js'
import { classlist } from '../support/dom_properties.js'
import { QueryConfig } from '../support/query_config.js'

import { icon } from './icon.js'
import { link } from './link.js'

function * iterPaginators(pages: number, config: QueryConfig<{ page: number }>) {
  const currentPage = config.get('page') as number

  yield c(link,
    {
      class: classlist('paginator paginator-prev', currentPage === 1 && 'disabled'),
      link: currentPage === 1 ? '' : config.getUpdatedPath({ page: currentPage - 1 }),
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
        link: config.getUpdatedPath({ page: i }),
        isInternal: true
      },
      c('span', { text: String(i) })
    )
  }

  yield c(link,
    {
      disabled: currentPage === pages,
      class: classlist('paginator paginator-next', currentPage === pages && 'disabled'),
      link: currentPage === pages ? '' : config.getUpdatedPath({ page: currentPage + 1 }),
      isInternal: true
    },
    c(icon, {
      name: 'chevron-left'
    })
  )
}

export function pagination({
  pages, config
}: {
  pages: number,
  config: QueryConfig<{ page: number }>
}) {
  return c('div', { class: 'pagination' },
    ...iterPaginators(pages, config)
  )
}
