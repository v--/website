import { type WebsiteLanguageId } from '../languages.ts'
import { type UrlPath } from '../support/url_path.ts'

/**
 * We support ISO 639 (i.e. en, eng) and IETF BCP 47 (i.e. en-US, en_US) strings.
 *
 * All those formats without the last (en_US) is supported by Intl.Locale, and we use it to do the parsing.
 *
 * Although [1] recommends dashes, underscores are commonly used (e.g. Facebook's Open Graph Protocol and fb_locale).
 *
 * [1] https://datatracker.ietf.org/doc/html/rfc5646
 */
export function parseSupportedLanguageString(str?: string): WebsiteLanguageId | undefined {
  if (str === undefined) {
    return undefined
  }

  let locale: Intl.Locale

  try {
    locale = new Intl.Locale(str.replaceAll('_', '-'))
  } catch (err) {
    return undefined
  }

  switch (locale.language) {
    case 'en':
      return 'en'
    case 'ru':
      return 'ru'
    default:
      return undefined
  }
}

export function parseSupportedQueryParamLanguage(urlPath: UrlPath): WebsiteLanguageId | undefined {
  return parseSupportedLanguageString(urlPath.query.get('override-language')) ??
    parseSupportedLanguageString(urlPath.query.get('fb_locale'))
}
