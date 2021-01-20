declare namespace TComponents {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ComponentStateType<T = any> = T
  export type FactoryComponentType<T> = (state: TObservables.BaseType<T>, children: IComponent[]) => IComponent

  export type IPotentialComponent = IComponent | null | undefined | boolean | number | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type IComponentStateSource<T = any> = ComponentStateType<T> | TObservables.IObservable<ComponentStateType<T>>

  export type IComponent = {
    type: string | FactoryComponentType<unknown>
    state: ComponentStateType
    stateSource: IComponentStateSource
    children: IComponent[]

    updateState<T>(newState: ComponentStateType<T>): void
    updateStateSource<T>(newState: IComponentStateSource<T>): void
  }
}
