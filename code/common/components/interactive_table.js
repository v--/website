import { c } from '../rendering/component.js'
import { ClientError } from '../errors.js'
import { classlist } from '../support/dom_properties.js'
import { QueryConfig } from '../support/query_config.js'
import { orderComparator, inverseOrderComparator } from '../support/sorting.js'

import { table } from './table.js'

import { icon } from './icon.js'
import { link } from './link.js'

// The sorting key is specified below using Object.assign
const QUERY_CONFIG_DEFAULTS = Object.freeze({
  per_page: 10,
  page: 1
})

const QUERY_CONFIG_PARSERS = Object.freeze({
  per_page: Number,
  sorting: Number,
  page: Number
})

function sliceData ({ columns, data, fixedData, sorting, perPage, page }) {
  const column = columns[Math.abs(sorting) - 1]
  const valueComparator = sorting > 0 ? orderComparator : inverseOrderComparator

  const comparator = function comparator (a, b) {
    return valueComparator(column.value(a), column.value(b))
  }

  const pageStart = (page - 1) * perPage
  const fixed = Array.from(fixedData).sort(comparator)
  const dynamic = Array.from(data).sort(comparator)
    .slice(pageStart, pageStart + perPage - fixed.length + 1)

  return fixed.concat(dynamic)
}

function * pagination (pages, config) {
  const currentPage = config.get('page')

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

export function interactiveTable ({ class: cssClass, columns, data, defaultSorting = 1, fixedData = [], path }) {
  const config = new QueryConfig(path, Object.assign({ sorting: defaultSorting }, QUERY_CONFIG_DEFAULTS), QUERY_CONFIG_PARSERS)
  const perPage = config.get('per_page')
  const page = config.get('page')
  const sorting = config.get('sorting')

  if (sorting === 0 || Math.abs(sorting) > columns.length) {
    throw new ClientError(`Invalid column index ${Math.abs(sorting)} specified`)
  }

  if (perPage < 1) {
    throw new ClientError(`Invalid number of items per page ${perPage} specified`)
  }

  const pages = Math.ceil(data.length / perPage)

  if (page < 1 || (pages !== 0 && page > pages)) {
    throw new ClientError(`Invalid page index ${page} specified`)
  }

  const sliced = sliceData({ columns, data, fixedData, sorting, perPage, page })
  const patchedColumns = []

  for (let i = 1; i <= columns.length; i++) {
    const newColumn = Object.assign({}, columns[i - 1])
    const newSortingValue = Math.abs(sorting) === i ? -sorting : i
    let iconName

    if (Math.abs(sorting) === i) {
      iconName = sorting > 0 ? 'sort-ascending' : 'sort-descending'
    } else {
      iconName = 'sort-variant'
    }

    newColumn.header = c(
      link,
      {
        class: 'heading',
        link: config.getUpdatedPath({ sorting: newSortingValue }),
        isInternal: true
      },
      c(icon, { name: iconName }),
      c('span', { text: newColumn.label })
    )

    patchedColumns.push(newColumn)
  }

  return c(table,
    {
      class: classlist('interactive-table', cssClass),
      data: sliced,
      columns: patchedColumns
    },
    pages > 1 && c('thead', null,
      c('tr', null,
        c('td', { colspan: '4', class: 'pagination-wrapper' },
          c('div', { class: 'pagination' },
            ...pagination(pages, config)
          )
        )
      )
    )
  )
}
