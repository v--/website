import { type IVerticalTableColumnSpec } from './vertical_table.ts'
import { type QueryConfig } from '../support/query_config.ts'

export type SortDirection = 'asc' | 'desc' | 'neutral'

export interface IInteractiveTableColumnSpec<T, R = unknown> extends Omit<IVerticalTableColumnSpec<T>, 'header'> {
  sortingValue(datum: T): R
}

export type IInteractiveTableQuerySchema = {
  sort_asc?: string
  sort_desc?: string
  per_page: string
  page: string
}

export type InteractiveTableQueryConfig = QueryConfig<IInteractiveTableQuerySchema>

export interface ISortStatus<T> {
  direction: SortDirection
  columnSpec: IInteractiveTableColumnSpec<T>
}
