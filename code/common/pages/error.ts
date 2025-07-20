import { icon } from '../components/icon.ts'
import { rich } from '../components/rich.ts'
import { EMAIL_URL, GITHUB_PROJECT_URL } from '../constants/url.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { EncodedErrorDecoder } from '../presentable_errors/decoder.ts'
import { type IEncodedError } from '../presentable_errors.ts'
import { createComponent as c } from '../rendering/component.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function errorPage(pageState: IWebsitePageState<IEncodedError>, env: WebsiteEnvironment) {
  const decoder = new EncodedErrorDecoder(pageState.pageData)
  const titleSpec = decoder.getTitleSpec()
  const subtitleSpec = decoder.getSubtitleSpec()
  const detailsSpec = decoder.getDetailsSpec()

  return c.html('main', { class: 'error-page' },
    c.factory(icon, {
      refId: 'core',
      name: 'solid/triangle-exclamation',
      class: 'icon-huge error-page-icon',
    }),
    c.factory(rich, {
      rootCssClass: 'error-page-title',
      rootTag: 'h1',
      mode: 'paragraph',
      doc: env.gettext.rich$({ ...titleSpec, coerce: true }),
    }),
    c.factory(rich, {
      rootCssClass: 'error-page-subtitle',
      rootTag: 'h2',
      mode: 'paragraph',
      doc: env.gettext.rich$({ ...subtitleSpec, coerce: true }),
    }),
    detailsSpec && c.factory(rich, {
      rootCssClass: 'error-page-details',
      rootTag: 'h3',
      mode: 'paragraph',
      doc: env.gettext.rich$({ ...detailsSpec, coerce: true }),
    }),
    c.factory(rich, {
      mode: 'paragraph',
      doc: env.gettext.rich$({
        bundleId: 'core', key: 'error_page.suggestion',
        context: { githubProjectUrl: GITHUB_PROJECT_URL, emailUrl: EMAIL_URL },
      }),
    }),
  )
}
