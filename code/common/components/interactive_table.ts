import { anchor } from './anchor.ts'
import { icon } from './icon.ts'
import { paginator } from './paginator.ts'
import { spacer } from './spacer.ts'
import { verticalTable } from './vertical_table.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { c } from '../rendering/component.ts'
import { classlist } from '../support/dom_properties.ts'
import { QueryConfig } from '../support/query_config.ts'
import { getNextSortParams, parsePage, parsePerPage, parseSortStatus, sliceData } from '../support/table_interaction.ts'
import { type UrlPath } from '../support/url_path.ts'
import { type uint32 } from '../types/numbers.ts'
import {
  type IInteractiveTableColumnSpec,
  type IInteractiveTableQuerySchema,
  type ISortStatus,
  type InteractiveTableQueryConfig,
  type SortDirection,
} from '../types/table_interaction.ts'
import { type IVerticalTableColumnSpec } from '../types/vertical_table.ts'

interface IInteractiveTableState<T> {
  class: string
  columnSpecs: IInteractiveTableColumnSpec<T>[]
  data: T[]
  urlPath: UrlPath
}

// TODO: Figure out a good UI/UX experience for allowing the user to change these.
// It is not as trivial as it seems because HTML select elements cannot "submit", meaning that the query parameter will not change without JavaScript.
const DEFAULT_PER_PAGE: uint32 = 10

export function interactiveTable<T = unknown>(
  { class: cssClass, columnSpecs, data, urlPath }: IInteractiveTableState<T>,
  env: WebsiteEnvironment,
) {
  const queryDefaults: IInteractiveTableQuerySchema = { per_page: String(DEFAULT_PER_PAGE), page: '1' }
  const config: InteractiveTableQueryConfig = new QueryConfig(urlPath, queryDefaults)

  const perPage = parsePerPage(env, config.get('per_page'))
  const pageCount = Math.max(1, Math.ceil(data.length / perPage))
  const currentPage = parsePage(env, config.get('page'), pageCount)

  const sortStatus = parseSortStatus(env, config.get('sort_asc'), config.get('sort_desc'), columnSpecs)

  const sliced = sliceData(sortStatus, data, perPage, currentPage)
  const mappedColumns = columnSpecs.map(function (spec) {
    const columnDirection = (sortStatus.columnSpec === spec) ? sortStatus.direction : 'neutral'
    return mapColumnSpec({ columnSpec: spec, direction: columnDirection }, config, env)
  })

  return c('div', { class: 'interactive-table-wrapper' },
    c(verticalTable<T>,
      {
        tableClass: classlist('interactive-table', cssClass),
        data: sliced,
        columnSpecs: mappedColumns,
      },
    ),

    pageCount > 1 && c(paginator, {
      pageCount,
      currentPage,
      getUpdatedPath(page: uint32) {
        return config.getUpdatedPath({ page: String(page + 1) })
      },
    }),
  )
}

function getSvgIconFromDirection(direction: SortDirection) {
  switch (direction) {
    case 'asc':
      return 'solid/sort-up'
    case 'desc':
      return 'solid/sort-down'
    case 'neutral':
      return 'solid/sort'
  }
}

function getHeaderAria<T>(sortStatus: ISortStatus<T>) {
  const { direction } = sortStatus

  switch (direction) {
    case 'asc':
      return { sort: 'ascending' }
    case 'desc':
      return { sort: 'descending' }
    case 'neutral':
      return { sort: 'none' }
  }
}

function mapColumnSpec<T>(
  sortStatus: ISortStatus<T>,
  config: InteractiveTableQueryConfig,
  env: WebsiteEnvironment,
): IVerticalTableColumnSpec<T> {
  const _ = env.gettext$
  const { columnSpec, direction } = sortStatus
  const nextSortParams = getNextSortParams(sortStatus)

  return {
    label: columnSpec.label,
    value: columnSpec.value,
    class: columnSpec.class,
    id: columnSpec.id,
    headerAria: getHeaderAria(sortStatus),
    header: c(
      anchor,
      {
        isInternal: true,
        href: config.getUpdatedPath(nextSortParams),
      },
      c(icon, { refId: 'interactive_table', name: getSvgIconFromDirection(direction) }),
      c(spacer, { direction: 'horizontal', dynamics: 'pp' }),
      columnSpec.label && c('span', { text: _(columnSpec.label) }),
    ),
  }
}
