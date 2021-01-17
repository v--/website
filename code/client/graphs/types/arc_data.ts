export interface GraphArcDatum {
  label: string
  value: string
}

export type GraphArcData<T> = TypeCons.NonStrictMap<T, GraphArcDatum>
