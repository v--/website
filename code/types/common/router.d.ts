declare namespace TRouter {
  export type SidebarId =
    'home' |
    'files' |
    'pacman' |
    'playground' |
    'error'

  interface IPath {
    segments: string[]
    query: Map<string, string>
    clone(): IPath
    getParentPath(): IPath
    join(segment: string): IPath
    underCooked: string
    queryString: string
    cooked: string
  }

  export interface IRouterResult {
    title: string
    description: string
    path: IPath,
    factory: TComponents.FactoryComponentType<IRouterState> | TPlayground.PlaygroundPage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
    sidebarId?: SidebarId
  }

  export interface IRouterState extends IRouterResult {
    loading: boolean
    isCollapsed: boolean
    toggleCollapsed: () => void
    darkScheme: boolean
    toggleDarkScheme: () => void
  }

  export type IRouterStatePartial = TCons.PartialWith<IRouterState, 'loading' | 'isCollapsed' | 'toggleCollapsed' | 'darkScheme' | 'toggleDarkScheme'>
}
