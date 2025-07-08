import { type WebsiteLanguageId, parseSupportedLanguageString } from '../../common/languages.ts'
import { schwartzMax } from '../../common/support/iteration.ts'
import { type UnitRatio } from '../../common/types/numbers.ts'

export interface IAcceptedLanguage {
  languageId: WebsiteLanguageId
  weight?: UnitRatio
}

const LANGUAGE_SPEC_REGEX = /^\s*(?<lang>[a-zA-Z0-9-]+)?\s*(;\s*q=(?<weight>(1(.0+)?|0.\d+)))?\s*$/

export function* iterParseAcceptLanguageHeader(header: string): Generator<IAcceptedLanguage> {
  for (const spec of header.split(',')) {
    const match = spec.match(LANGUAGE_SPEC_REGEX)

    if (match === null || match.groups === undefined) {
      continue
    }

    const languageId = parseSupportedLanguageString(match.groups.lang)

    if (languageId === undefined) {
      continue
    }

    const result: IAcceptedLanguage = { languageId }

    if (match.groups.weight) {
      result.weight = Number.parseFloat(match.groups.weight)
    }

    yield result
  }
}

export function parsePreferredLanguage(header: string): WebsiteLanguageId | undefined {
  const max = schwartzMax(({ weight }) => weight ?? 1, iterParseAcceptLanguageHeader(header))

  if (max === undefined) {
    return undefined
  }

  return max.languageId
}
