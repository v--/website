import { CoolError } from '../../common/errors.ts'
import { schwartzMax } from '../../common/support/iteration.ts'
import { repr } from '../../common/support/strings.ts'
import { type UnitRatio } from '../../common/types/numbers.ts'

export interface IAcceptedLanguage {
  lang: string
  variant?: string
  weight?: UnitRatio
}

const LANGUAGE_SPEC_REGEX = /^\s*(?<lang>[a-z]+)(-(?<variant>[a-zA-Z0-9]+))?\s*(;\s*q=(?<weight>(1(.0+)?|0.\d+)))?\s*$/

export class LanguageHeaderError extends CoolError {}

export function parseAcceptLanguageHeader(header: string): IAcceptedLanguage[] {
  return header.split(',').map(function (spec) {
    if (spec === '*') {
      return { lang: '*' }
    }

    const match = spec.match(LANGUAGE_SPEC_REGEX)

    if (match === null) {
      throw new LanguageHeaderError(`Could not parse language header ${repr(header)}`)
    }

    const { lang, variant, weight } = match.groups!
    const result: IAcceptedLanguage = { lang }

    if (variant) {
      result.variant = variant
    }

    if (weight) {
      result.weight = Number.parseFloat(weight)
    }

    return result
  })
}

export function getPreferredLanguage(header: string): IAcceptedLanguage | undefined {
  let languages: IAcceptedLanguage[]

  try {
    languages = parseAcceptLanguageHeader(header).filter(({ lang }) => lang !== '*')
  } catch (err) {
    return undefined
  }

  if (languages.length === 0) {
    return undefined
  }

  return schwartzMax(({ weight }) => weight ?? 1, languages)
}
