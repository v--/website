import { icon } from '../components/icon.ts'
import { rich } from '../components/rich.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { c } from '../rendering/component.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function placeholder({ urlPath }: IWebsitePageState, env: WebsiteEnvironment) {
  const _ = env.gettext$

  return c('main', { class: 'placeholder-page' },
    c('noscript', { class: 'placeholder-page-unsupported' },
      c(icon, { refId: 'placeholder', name: 'solid/ban', class: 'icon-huge placeholder-page-unsupported-icon' }),
      c('h1', { text: _({ bundleId: 'placeholder', key: 'heading.unsupported' }) }),
      c(rich, {
        doc: _(
          {
            bundleId: 'placeholder', key: 'message.unsupported',
            context: { url: urlPath.toString() },
          },
          { rich: true },
        ),
      }),
    ),
    c('div', { class: 'placeholder-page-loading require-javascript' },
      c('h1', {
        class: 'placeholder-page-loading-text',
        text: _({ bundleId: 'placeholder', key: 'heading.loading' }),
      }),
    ),
  )
}
