import { c } from '../rendering/component'
import { ClientError } from '../errors'
import { classlist } from '../support/dom_properties'
import QueryConfig from '../support/query_config'

import table from './table'

import icon from './icon'
import link from './link'

const QUERY_CONFIG_DEFAULTS = Object.freeze({
  per_page: 10,
  sorting: 1,
  page: 1
})

const QUERY_CONFIG_PARSERS = Object.freeze({
  per_page: Number,
  sorting: Number,
  page: Number
})

function sliceData ({ columns, data, fixedData, config }) {
  const sorting = config.get('sorting')
  const perPage = config.get('per_page')
  const page = config.get('page')

  const column = columns[Math.abs(sorting) - 1]
  const ascending = sorting > 0 ? 1 : -1

  function comparator (a, b) {
    if (column.value(a) === column.value(b)) {
      return 0
    }

    return ascending * (column.value(a) > column.value(b) ? 1 : -1)
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

export default function interactiveTable ({ class: cssClass, style, columns, data, fixedData = [], path }) {
  const config = new QueryConfig(path, QUERY_CONFIG_DEFAULTS, QUERY_CONFIG_PARSERS)
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

  const sliced = sliceData({ columns, data, fixedData, config })
  const newColumns = columns.map(function (column, i) {
    const columnIndex = i + 1
    const newColumn = Object.assign({}, column)

    if (Math.abs(sorting) === columnIndex) {
      newColumn.icon = sorting > 0 ? 'sort-ascending' : 'sort-descending'
    } else {
      newColumn.icon = 'sort-variant'
    }

    const newSortingValue = Math.abs(sorting) === columnIndex ? -sorting : columnIndex
    newColumn.link = function (datum) {
      if (datum === null) {
        return {
          url: config.getUpdatedPath({ sorting: newSortingValue }),
          isInternal: true
        }
      } else if (typeof column.link === 'function') {
        return column.link(datum)
      } else {
        return column.link
      }
    }

    return newColumn
  })

  return c(table,
    {
      class: classlist('interactive-table', cssClass),
      style: style,
      data: sliced,
      columns: newColumns
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
