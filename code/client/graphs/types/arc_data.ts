import { NonStrictMap } from '../../../common/types/non_strict_map.js'

export interface GraphArcDatum {
  label: string
  value: string
}

export type GraphArcData<T> = NonStrictMap<T, GraphArcDatum>
