import { c } from '../rendering/component.js'
import { NotFoundError } from '../errors.js'
import { classlist } from '../support/dom_properties.js'
import { QueryConfig } from '../support/query_config.js'
import { orderComparator, inverseOrderComparator } from '../support/sorting.js'

import { table } from './table.js'
import { pagination } from './pagination.js'

import { icon } from './icon.js'
import { anchor } from './anchor.js'
import { repr } from '../support/strings.js'

/**
 * @typedef {{
   sort_by: string
   sort_descending: string
   per_page: string
   page: string
  }} IQueryConfig
 */

/**
 * @typedef {
   import('./table.js').ITableColumn & {
     sortingLabel: string
   }
 } IInteractiveTableColumn
 */

/**
 * @param {{
    columns: IInteractiveTableColumn[],
    data: unknown[],
    sortByColumnId: number,
    descending: boolean,
    perPage: number
    page: number
  }} param1
 */
export function sliceData({
  columns,
  data,
  sortByColumnId,
  descending,
  perPage,
  page
}) {
  const pageStart = (page - 1) * perPage

  if (sortByColumnId === -1) {
    return data.slice(pageStart, pageStart + perPage)
  }

  const column = columns[sortByColumnId]
  const valueComparator = descending ? inverseOrderComparator : orderComparator

  /**
   * @param {unknown} a
   * @param {unknown} b
   */
  const comparator = function comparator(a, b) {
    return valueComparator(column.value(a), column.value(b))
  }

  return Array.from(data).sort(comparator)
    .slice(pageStart, pageStart + perPage)
}

/**
 * @param {{
    class: string,
    columns: IInteractiveTableColumn[],
    data: unknown[],
    path: TRouter.IPath
  }} state
 */
export function interactiveTable({
  class: cssClass,
  columns,
  data, 
  path
}) {
  /** @type {TCons.PartialWith<IQueryConfig, 'sort_by'>} */
  const queryDefaults = { per_page: '10', page: '1', sort_descending: 'false' }
  const config = new QueryConfig(path, queryDefaults)

  const sortByRaw = config.get('sort_by')
  const sortDescendingRaw = config.get('sort_descending')
  const perPage = Number(config.get('per_page'))
  const page = Number(config.get('page'))

  const sortByColumnId = sortByRaw === undefined ? -1 : columns.findIndex(c => sortByRaw === c.sortingLabel)

  if (sortByRaw !== undefined && sortByColumnId === -1) {
    throw new NotFoundError(`Invalid sorting column ${repr(sortByRaw)} specified`)
  }

  const descending = sortDescendingRaw === 'true'

  if (perPage < 1) {
    throw new NotFoundError(`Invalid number of items per page ${perPage} specified`)
  }

  const pages = Math.ceil(data.length / perPage)

  if (page < 1 || (pages !== 0 && page > pages)) {
    throw new NotFoundError(`Invalid page index ${page} specified`)
  }

  const sliced = sliceData({ columns, data, sortByColumnId, descending, perPage, page })
  const patchedColumns = []

  for (let i = 0; i <= columns.length - 1; i++) {
    const newColumn = Object.assign({}, columns[i])
    let iconName

    if (sortByColumnId === i) {
      iconName = descending ? 'sort-descending' : 'sort-ascending'
    } else {
      iconName = 'sort-variant'
    }

    newColumn.header = c(
      anchor,
      {
        class: 'heading',
        isInternal: true,
        href: config.getUpdatedPath({
          sort_by: columns[i].sortingLabel,
          sort_descending: i === sortByColumnId ? String(!descending) : 'false'
        })
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
    pages > 1 && c('thead', undefined,
      c('tr', undefined,
        c('th', { colspan: '4', class: 'pagination-wrapper' },
          c(pagination, { pages, config })
        )
      )
    )
  )
}
