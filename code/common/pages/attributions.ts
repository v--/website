import { rich } from '../components/rich.ts'
import { BOXICONS_URL, CC0_URL, CC4_BY_URL, GITHUB_PROJECT_URL } from '../constants/url.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function attributionsPage(pageState: IWebsitePageState, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('attributions')

  return c.html('main', { class: 'attributions-page' },
    c.html('h1', { text: _('heading.main') }),
    c.factory(rich, {
      doc: _.rich$({
        key: 'text',
        context: {
          cc0Url: CC0_URL,
          cc4ByUrl: CC4_BY_URL,
          boxIconsUrl: BOXICONS_URL,
          projectUrl: GITHUB_PROJECT_URL,
        },
      }),
    }),
  )
}
