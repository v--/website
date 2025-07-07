import { icon } from '../components/icon.ts'
import { rich } from '../components/rich.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function placeholder({ urlPath }: IWebsitePageState, env: WebsiteEnvironment) {
  const _ = env.gettext.bindToBundle('placeholder')

  return c.html('main', { class: 'placeholder-page' },
    c.html('noscript', { class: 'placeholder-page-unsupported' },
      c.factory(icon, { refId: 'placeholder', name: 'solid/ban', class: 'icon-huge placeholder-page-unsupported-icon' }),
      c.html('h1', { text: _('heading.unsupported') }),
      c.factory(rich, {
        doc: _.rich$({
          key: 'message.unsupported',
          context: { url: urlPath.toString() },
        }),
      }),
    ),
    c.html('div', { class: 'placeholder-page-loading require-javascript' },
      c.html('h1', {
        class: 'placeholder-page-loading-text',
        text: _('heading.loading'),
      }),
    ),
  )
}
