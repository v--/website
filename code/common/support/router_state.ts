import { ClientError, CoolError } from '../errors.js'
import { error as errorView } from '../views/error.js'
import { SidebarId } from '../enums/sidebar_id.js'
import { Path } from './path.js'
import { FactoryComponentType } from '../rendering/component.js'
import { PlaygroundPage } from '../types/playground_page.js'

export interface RouterStateParams {
  title: string
  path: Path
  factory: FactoryComponentType<RouterState> | PlaygroundPage
  data?: unknown
  description?: string
  loading?: boolean
  sidebarId?: SidebarId,
  isCollapsed?: boolean
  toggleCollapsed?: Action<MouseEvent>
}

export interface RouterState extends Required<RouterStateParams> {}
export class RouterState {
  static error(path: Path, err: Error) {
    return new this({
      path,
      sidebarId: SidebarId.error,
      title: CoolError.isDisplayable(err) ? (err as ClientError).title.toLowerCase() : 'error',
      description: 'An error has occurred.',
      factory: errorView,
      data: err
    })
  }

  constructor(payload: RouterStateParams) {
    Object.assign(this, {
      description: '',
      isCollapsed: false,
      data: null,
      loading: false,
      sidebarId: null
    }, payload)
  }
}
