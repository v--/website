import { anchor } from '../components/anchor.ts'
import { rich } from '../components/rich.ts'
import { GITHUB_PROJECT_URL } from '../constants/url.ts'
import { WebsiteEnvironment } from '../environment.ts'
import { c } from '../rendering/component.ts'
import { snakeToKebabCase } from '../support/strings.ts'
import { PLAYGROUND_PAGE_IDS } from '../types/bundles.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function playgroundPage(pageState: IWebsitePageState, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('playground')

  return c('main', { class: 'playground-page' },
    c('section', undefined,
      c('h1', { text: _('heading') }),
      c(rich, {
        doc: _.rich$({
          key: 'text',
          context: { projectUrl: GITHUB_PROJECT_URL },
        }),
      }),
      c('dl', undefined,
        ...PLAYGROUND_PAGE_IDS.flatMap(playgroundId => {
          return [
            c('dt', undefined,
              c(anchor, {
                href: `/playground/${snakeToKebabCase(playgroundId)}`,
                isInternal: true,
              }),
            ),
            c('dd', {
              text: _({
                bundleId: 'core',
                key: `description.playground.${playgroundId}`,
              }),
            }),
          ]
        }),
      ),
      c(rich, {
        doc: _.rich$('footnote'),
      }),
    ),
  )
}
