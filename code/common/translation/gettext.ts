import { type SubstitutionContext, substitutePlain, substituteRich } from '../rich/substitution.ts'
import { type IRichTextDocument, convertPlainToRich, convertRichToPlain } from '../rich.ts'
import { TranslationError } from './errors.ts'
import { type ITranslationMap, type ITranslationSpec } from './types.ts'
import { type Observable } from '../observable.ts'
import { repr } from '../support/strings.ts'

export interface IGettextOptions {
  rich?: boolean
  coerce?: boolean
}

export interface IGettextParams {
  translationMap: ITranslationMap
  key: string
  context?: SubstitutionContext
  options?: IGettextOptions
}

export function gettext(params: IGettextParams & { options?: undefined }): string
export function gettext(params: IGettextParams & { options: { coerce?: boolean, rich?: false } }): string
export function gettext(params: IGettextParams & { options: { coerce?: boolean, rich: true } }): IRichTextDocument
export function gettext(params: IGettextParams): string | IRichTextDocument
export function gettext(params: IGettextParams): string | IRichTextDocument {
  const rawValue = params.translationMap[params.key]

  if (rawValue === undefined) {
    throw new TranslationError(`Missing value for translation key ${repr(params.key)}`)
  }

  if (typeof rawValue === 'string') {
    const value = params.context ? substitutePlain(rawValue, params.context) : rawValue

    if (params.options?.rich) {
      if (params.options?.coerce) {
        return convertPlainToRich(value)
      }

      throw new TranslationError(`Expecting rich text for key ${repr(params.key)}, but got a plain string`)
    }

    return value
  } else {
    const value = params.context ? substituteRich(rawValue, params.context) : rawValue

    if (!params.options?.rich) {
      if (params.options?.coerce) {
        return convertRichToPlain(value)
      }

      throw new TranslationError(`Expecting a plain string for key ${repr(params.key)}, but got rich text`)
    }

    return value
  }
}

export interface IDelayedTranslator {
  (spec: ITranslationSpec): Promise<string>
  (spec: ITranslationSpec, options: IGettextOptions & { rich: false | undefined }): Promise<string>
  (spec: ITranslationSpec, options: IGettextOptions & { rich: true }): Promise<IRichTextDocument>
  (spec: ITranslationSpec, options?: IGettextOptions): Promise<string | IRichTextDocument>
}

export interface IContinuousTranslator {
  (spec: ITranslationSpec): Observable<string>
  (spec: ITranslationSpec, options: IGettextOptions & { rich: false | undefined }): Observable<string>
  (spec: ITranslationSpec, options: IGettextOptions & { rich: true }): Observable<IRichTextDocument>
  (spec: ITranslationSpec, options?: IGettextOptions): Observable<string | IRichTextDocument>
}
