import { fleeingButtonStage } from './components/fleeing_button_stage.ts'
import { DEFAULT_STATE } from './constants.ts'
import { type IFleeingButtonState } from './types.ts'
import { checkbox } from '../../common/components/checkbox.ts'
import { rich } from '../../common/components/rich.ts'
import { spacer } from '../../common/components/spacer.ts'
import { GITHUB_PROJECT_CODE_URL } from '../../common/constants/url.ts'
import { c } from '../../common/rendering/component.ts'
import { StateStore } from '../../common/support/state_store.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { playgroundMenu } from '../core/components/playground_menu.ts'
import { spotlightPage } from '../core/components/spotlight_page.ts'
import { type ClientWebsiteEnvironment } from '../core/environment.ts'

export function indexPage(pageState: IWebsitePageState, env: ClientWebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('fleeing_button')
  const store = new StateStore<IFleeingButtonState>({
    ...DEFAULT_STATE,
    mousePosition: undefined,
    activeAttractor: undefined,
    debug: false,
  }, env.pageUnload$)

  return c(spotlightPage,
    {
      class: 'fleeing-button-page',
      stage: c(fleeingButtonStage, { store }),
      menu: c(playgroundMenu, undefined,
        c(checkbox, {
          name: 'debug-mode',
          value: store.keyedObservables.debug,
          content: _('control.debug'),
          update(newValue: boolean) {
            store.update({ debug: newValue })
          },
        }),
      ),
    },
    c(spacer),
    c(rich, {
      rootTag: 'section',
      doc: _.rich$({
        key: 'text',
        context: {
          githubPageUrl: `${GITHUB_PROJECT_CODE_URL}/client/fleeing_button`,
        },
      }),
    }),
  )
}
