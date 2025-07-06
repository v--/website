import { type WebsiteEnvironment } from '../environment.ts'
import { map } from '../observable.ts'
import { c } from '../rendering/component.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function title(state: IWebsitePageState, env: WebsiteEnvironment) {
  const titleString$ = env.gettext(state.titleSpec).pipe(
    map(title => `${title} | ivasilev.net`),
  )

  return c('title', { text: titleString$ })
}
