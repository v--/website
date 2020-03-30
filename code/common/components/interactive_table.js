import { c } from '../rendering/component.js'
import { ClientError } from '../errors.js'
import { classlist } from '../support/dom_properties.js'
import { QueryConfig } from '../support/query_config.js'
import { orderComparator, inverseOrderComparator } from '../support/sorting.js'

import { table } from './table.js'
import { pagination } from './pagination.js'

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

function sliceData ({ columns, data, sorting, perPage, page }) {
  const column = columns[Math.abs(sorting) - 1]
  const valueComparator = sorting > 0 ? orderComparator : inverseOrderComparator

  const comparator = function comparator (a, b) {
    return valueComparator(column.value(a), column.value(b))
  }

  const pageStart = (page - 1) * perPage
  return Array.from(data).sort(comparator)
    .slice(pageStart, pageStart + perPage)
}

export function interactiveTable ({ class: cssClass, columns, data, defaultSorting = 1, path }) {
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

  const sliced = sliceData({ columns, data, sorting, perPage, page })
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
        c('th', { colspan: '4', class: 'pagination-wrapper' },
          pagination(pages, config)
        )
      )
    )
  )
}
