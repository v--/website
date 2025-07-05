import { anchor } from '../components/anchor.ts'
import { rich } from '../components/rich.ts'
import { GITHUB_PROJECT_URL } from '../constants/url.ts'
import { WebsiteEnvironment } from '../environment.ts'
import { c } from '../rendering/component.ts'
import { PLAYGROUND_PAGE_IDS } from '../types/bundles.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function playgroundPage(pageState: IWebsitePageState, env: WebsiteEnvironment) {
  const _ = env.gettext$

  return c('main', { class: 'playground-page' },
    c('section', undefined,
      c('h1', { text: _({ bundleId: 'playground', key: 'heading' }) }),
      c(rich, {
        doc: _(
          {
            bundleId: 'playground', key: 'text',
            context: { projectUrl: GITHUB_PROJECT_URL },
          },
          { rich: true },
        ),
      }),
      c('dl', undefined,
        ...PLAYGROUND_PAGE_IDS.flatMap(playgroundId => {
          return [
            c('dt', undefined,
              c(anchor, {
                href: `/playground/${playgroundId}`,
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
        doc: _({ bundleId: 'playground', key: 'footnote' }, { rich: true }),
      }),
    ),
  )
}
