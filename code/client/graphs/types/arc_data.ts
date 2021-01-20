export interface GraphArcDatum {
  label: string
  value: string
}

export type GraphArcData<T> = TCons.NonStrictMap<T, GraphArcDatum>
