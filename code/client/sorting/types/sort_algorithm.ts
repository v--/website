import { ActionList } from '../support/action_list.js'

export interface SortAlgorithm {
  name: string,
  date: TDates.ISODateString,
  stable: boolean,
  time: string,
  space: string,
  implementation(sortable: ActionList): void
}
