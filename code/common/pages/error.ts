import { icon } from '../components/icon.ts'
import { rich } from '../components/rich.ts'
import { type WebsiteEnvironment } from '../environment.ts'
import { EncodedErrorDecoder } from '../presentable_errors/decoder.ts'
import { type IEncodedError } from '../presentable_errors.ts'
import { c } from '../rendering/component.ts'
import { type IWebsitePageState } from '../types/page.ts'

export function errorPage(pageState: IWebsitePageState<IEncodedError>, env: WebsiteEnvironment) {
  const _ = env.gettext$
  const decoder = new EncodedErrorDecoder(pageState.pageData)
  const titleSpec = decoder.getTitleSpec()
  const messageSpec = decoder.getMessageSpec()
  const causeSpec = decoder.getCauseSpec()

  return c('main', { class: 'error-page' },
    c(icon, {
      refId: 'core',
      name: 'solid/triangle-exclamation',
      class: 'icon-huge error-page-icon',
    }),
    c(rich, {
      rootCssClass: 'error-page-title',
      rootTag: 'h1',
      mode: 'paragraph',
      doc: _(titleSpec, { rich: true, coerce: true }),
    }),
    c(rich, {
      rootCssClass: 'error-page-message',
      rootTag: 'h2',
      mode: 'paragraph',
      doc: _(messageSpec, { rich: true, coerce: true }),
    }),
    causeSpec && c(rich, {
      rootCssClass: 'error-page-cause',
      rootTag: 'h3',
      mode: 'paragraph',
      doc: _(causeSpec, { rich: true, coerce: true }),
    }),
    c(rich, {
      mode: 'paragraph',
      doc: _({ bundleId: 'core', key: 'error_page.suggestion' }, { rich: true, coerce: true }),
    }),
  )
}
