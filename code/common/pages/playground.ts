import { anchor } from '../components/anchor.ts'
import { rich } from '../components/rich.ts'
import { GITHUB_PROJECT_URL } from '../constants/url.ts'
import { WebsiteEnvironment } from '../environment.ts'
import { createComponent as c } from '../rendering/component.ts'
import { snakeToKebabCase } from '../support/strings.ts'
import { PLAYGROUND_PAGE_IDS } from '../types/bundles.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function playgroundPage(pageState: IWebsitePageState, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('playground')

  return c.html('main', { class: 'playground-page' },
    c.html('section', undefined,
      c.html('h1', { text: _('heading') }),
      c.factory(rich, {
        doc: _.rich$({
          key: 'text',
          context: { projectUrl: GITHUB_PROJECT_URL },
        }),
      }),
      c.html('dl', undefined,
        ...PLAYGROUND_PAGE_IDS.flatMap(playgroundId => {
          return [
            c.html('dt', undefined,
              c.factory(anchor, {
                href: `/playground/${snakeToKebabCase(playgroundId)}`,
                isInternal: true,
              }),
            ),
            c.html('dd', {
              text: _({
                bundleId: 'core',
                key: `description.playground.${playgroundId}`,
              }),
            }),
          ]
        }),
      ),
      c.factory(rich, {
        doc: _.rich$('footnote'),
      }),
    ),
  )
}
