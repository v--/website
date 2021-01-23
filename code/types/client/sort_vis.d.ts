declare namespace TSortVis {
  export interface ISortAction {
    i: TNum.UInt32
    j: TNum.UInt32
    swapped: boolean
  }

  export interface ISequence {
    name: string,
    constructArray(): TNum.Float64[]
  }

  export interface IActionListParams {
    array: TNum.Float64[]
    actions?: (ISortAction | undefined)[]
  }

  export interface IActionList extends Required<IActionListParams> {
    originalArray: TNum.Float64[]
    length: TNum.UInt32
    get(i: TNum.UInt32): TNum.Float64
    update(i: TNum.UInt32, j: TNum.UInt32, swapped: boolean): void
    finish(): void
    cloneOriginalArray(): TNum.Float64[]
  }

  export interface ISortAlgorithm {
    name: string,
    date: TDates.ISODateString,
    stable: boolean,
    time: string,
    space: string,
    implementation(sortable: IActionList): void
  }

  export interface ISorterComponentState {
    states: ISorterState[],
    algorithm: ISortAlgorithm,
    isRunning: boolean,
    hasFinished: boolean,
    run: TCons.Action<void>,
    pause: TCons.Action<void>,
    reset: TCons.Action<void>
  }

  export interface ISorterState {
    lastAction?: ISortAction,
    sequence: ISequence,
    state: TNum.Float64[]
  }

  interface IActionListCollection {
    sequence: TSortVis.ISequence,
    currentState: TNum.Float64[],
    actions: (TSortVis.ISortAction | undefined)[]
  }

  export interface ISorterParams {
    algorithm: ISortAlgorithm
    sequences: readonly ISequence[]
    state$: TObservables.IDictSubject<ISorterComponentState>
    actionListCollections: IActionListCollection[]
    actionListIndex: TNum.UInt32
    maxActionListIndex: TNum.UInt32
  }

  export interface ISorter extends ISorterParams {
    intervalObservable: TObservables.IObservable<void>
    intervalSubscription?: TObservables.ISubscription
  }
}
