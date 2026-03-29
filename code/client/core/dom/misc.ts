import { MissingElementError } from './errors.ts'
import { type WebsiteLanguageId, parseSupportedLanguageString } from '../../../common/languages.ts'
import { repr } from '../../../common/support/strings.ts'
import { UrlPath } from '../../../common/support/url_path.ts'
import { type ColorScheme } from '../../../common/types/page.ts'

export function aggressiveQuerySelector(element: Element, query: string) {
  const result = element.querySelector(query)

  if (result === null) {
    throw new MissingElementError(`Could not find an element in the body satisfying the query ${repr(query)}`)
  }

  return result
}

export function parsePreferredLanguage(): WebsiteLanguageId | undefined {
  for (const lang of navigator.languages) {
    const languageId = parseSupportedLanguageString(lang)

    if (languageId !== undefined) {
      return languageId
    }
  }

  return undefined
}

export function isLayoutCollapsed() {
  return window.getComputedStyle(document.body).getPropertyValue('--layout-collapsed') === 'true'
}

export function getActualColorScheme(): ColorScheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getCurrentUrlPath() {
  return UrlPath.parse(
    document.location.href.slice(document.location.origin.length),
  )
}

export function pushIntoHistory(urlPath: UrlPath) {
  window.history.pushState(null, window.document.title, urlPath.toString())
}
