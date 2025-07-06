import { inverseOrderComparator, orderComparator } from './iteration.ts'
import { PresentableError } from '../presentable_errors.ts'
import { type uint32 } from '../types/numbers.ts'
import {
  type IInteractiveTableColumnSpec,
  type IInteractiveTableQuerySchema,
  type ISortStatus,
} from '../types/table_interaction.ts'

export function parsePerPage(rawPerPage: string): uint32 {
  const perPage = Number(rawPerPage)

  if (!Number.isInteger(perPage) || perPage < 1) {
    throw new PresentableError({
      errorKind: 'http',
      code: 400,
      details: { bundleId: 'interactive_table_error', key: 'error.details.per_page.invalid' },
    })
  }

  return perPage
}

export function parsePage(rawPage: string, pageCount: uint32): uint32 {
  const currentPage = Number(rawPage) - 1

  if (!Number.isInteger(currentPage) || currentPage < 0) {
    throw new PresentableError({
      errorKind: 'http',
      code: 400,
      details: { bundleId: 'interactive_table_error', key: 'error.details.page.invalid' },
    })
  }

  if (currentPage >= pageCount) {
    throw new PresentableError({
      errorKind: 'http',
      code: 400,
      details: {
        bundleId: 'interactive_table_error', key: 'error.details.page.out_of_bounds',
        context: { pageCount },
      },
    })
  }

  return currentPage
}

export function parseSortStatus<T>(
  rawSortAsc: string | undefined,
  rawSortDesc: string | undefined,
  columnSpecs: IInteractiveTableColumnSpec<T>[],
): ISortStatus<T> {
  if (rawSortAsc !== undefined && rawSortDesc !== undefined) {
    throw new PresentableError({
      errorKind: 'http',
      code: 400,
      details: { bundleId: 'interactive_table_error', key: 'error.details.sort.conflict' },
    })
  }

  const rawValue = rawSortAsc ?? rawSortDesc

  if (rawValue === undefined) {
    return { direction: 'neutral', columnSpec: columnSpecs[0] }
  }

  const direction = rawSortDesc === undefined ? 'asc' : 'desc'
  const index = columnSpecs.findIndex(s => rawValue === s.id)

  if (index === -1) {
    throw new PresentableError({
      errorKind: 'http',
      code: 400,
      details: {
        bundleId: 'interactive_table_error', key: 'error.details.sort.unknown',
        context: {
          paramName: rawSortAsc === undefined ? 'sort_desc' : 'sort_asc',
        },
      },
    })
  }

  const columnSpec = columnSpecs[index]
  return { direction, columnSpec }
}

export function sliceData<T>(
  sortStatus: ISortStatus<T>,
  data: T[],
  perPage: uint32,
  currentPage: uint32,
): T[] {
  const pageStart = currentPage * perPage

  if (sortStatus.direction === 'neutral') {
    return data.slice(pageStart, pageStart + perPage)
  }

  const valueComparator = sortStatus.direction === 'desc' ? inverseOrderComparator : orderComparator
  const sortMapper = sortStatus.columnSpec.sortingValue

  function comparator(a: T, b: T) {
    return valueComparator(sortMapper(a), sortMapper(b))
  }

  return data.toSorted(comparator).slice(pageStart, pageStart + perPage)
}

export function getNextSortParams<T>(sortStatus: ISortStatus<T>): Pick<IInteractiveTableQuerySchema, 'sort_asc' | 'sort_desc'> {
  switch (sortStatus.direction) {
    case 'neutral':
      return {
        sort_asc: sortStatus.columnSpec.id,
        sort_desc: undefined,
      }

    case 'asc':
      return {
        sort_asc: undefined,
        sort_desc: sortStatus.columnSpec.id,
      }

    case 'desc':
      return {
        sort_asc: undefined,
        sort_desc: undefined,
      }
  }
}
