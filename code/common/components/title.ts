import { type WebsiteEnvironment } from '../environment.ts'
import { combineLatest, map } from '../observable.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function title({ titleSegmentSpecs }: IWebsitePageState, env: WebsiteEnvironment) {
  const title$ = combineLatest(titleSegmentSpecs.map(spec => env.gettext(spec))).pipe(
    map(segments => segments.join(' ⋅ ')),
  )

  return c.html('title', { text: title$ })
}
