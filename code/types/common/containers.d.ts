declare namespace TContainers {
  export interface IBinaryHeapParams<T> {
    payload?: T[],
    weights?: TNum.Float64[],
    payloadMap?: TCons.NonStrictMap<T, TNum.UInt32>
  }

  export interface IBinaryHeap<T> extends Required<IBinaryHeapParams<T>> {
    isEmpty: boolean
    insert(item: T, weight?: TNum.Float64): void
    peek(): { item: T, weight: TNum.Float64 }
    pop(): { item: T, weight: TNum.Float64 }
    hasItem(item: T): boolean
    getItemWeight(item: T): TNum.Float64
    updateItemWeight(item: T, weight: TNum.Float64): void
    clone(): IBinaryHeap<T>
  }
}
