import { DictSubject } from '../../../common/observables/dict_subject.js'
import { Path } from '../../../common/support/path.js'
import { RouterState } from '../../../common/support/router_state.js'
import { CoolError } from '../../../common/errors.js'

import { Store, MockStore } from '../store.js'
import { clientRouter } from '../router.js'
import { windowSize$ } from '../shared_observables.js'
import { loadBundle, isBrowserCompatibleWithBundle } from '../support/load_bundle.js'
import { navigateTo } from '../support/dom.js'
import { unsupported } from '../../../common/views/unsupported.js'
import { repr } from '../../../common/support/strings.js'
import { FactoryComponentType } from '../../../common/rendering/component.js'
import { PotentialObserver } from '../../../common/observables/observer.js'
import { WindowSize } from '../support/dom_observables.js'
import { PlaygroundPage } from '../../../common/types/playground_page.js'

class RoutingError extends CoolError {}

export async function loadFactory(factorySpec: FactoryComponentType<RouterState> | PlaygroundPage): Promise<FactoryComponentType<RouterState>> {
  switch (typeof factorySpec) {
    case 'function': return factorySpec
    case 'string':
      if (isBrowserCompatibleWithBundle(factorySpec)) {
        return loadBundle(factorySpec)
      }

      return unsupported

    default:
      throw new RoutingError(`Invalid page factory spec ${repr(factorySpec)}`)
  }
}

export class RouterService {
  state$: DictSubject<RouterState>

  private store: Store
  private path: Path
  private resizeObserver: PotentialObserver<WindowSize>

  static async initialize(url: string, serverData: unknown) {
    const path = Path.parse(url)
    const mockStore = new MockStore(serverData)
    const store = new Store()
    const state = await clientRouter(path, mockStore)
    return new this(state, store, path)
  }

  constructor(initialState: RouterState, store: Store, path: Path) {
    this.state$ = new DictSubject({
      ...initialState,
      loading: true,
      isCollapsed: !windowSize$.value.isDesktop,
      toggleCollapsed: () => {
        const newValue = !this.state$.value.isCollapsed
        this.state$.update({ isCollapsed: newValue })
      }
    })

    loadFactory(initialState.factory).then(factory => {
      try {
        this.state$.update({ factory, loading: false })
      } catch (err) {
        this.state$.error(err)
      }
    })

    this.store = store
    this.path = path

    this.resizeObserver = {
      next: (windowSize: WindowSize) => {
        const newValue = !windowSize.isDesktop

        if (this.state$.value.isCollapsed !== newValue) {
          this.state$.update({ isCollapsed: newValue })
        }
      }
    }

    windowSize$.subscribe(this.resizeObserver)
  }

  async displayError(url: string, err: Error) {
    this.state$.update(RouterState.error(Path.parse(url), err))
  }

  async processPath(path: Path): Promise<void> {
    this.path = path

    const isCollapsed = this.state$.value.isCollapsed || !windowSize$.value.isDesktop

    if (path.underCooked === this.state$.value.path.underCooked) {
      this.state$.update({ path, isCollapsed })
      return
    }

    this.state$.update({ loading: true, isCollapsed })
    const route = await clientRouter(path, this.store)

    // Cancel if another route has started loading
    if (this.path !== path) {
      return
    }

    const factory = await loadFactory(route.factory)

    if (this.path !== path) {
      return
    }

    this.state$.update({ ...route, factory })
  }

  async processURL(url: string) {
    const path = Path.parse(url)
    this.processPath(path)
  }

  async changeURL(url: string) {
    const path = Path.parse(url)
    navigateTo(path.cooked)
    await this.processPath(path)
  }
}
