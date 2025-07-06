import { SUBSTITUTION_CONTEXT_SCHEMA } from '../rich.ts'
import { TRANSLATION_BUNDLE_IDS, type TranslationBundleId } from '../types/bundles.ts'
import { type Infer, Schema } from '../validation.ts'

export const GENERIC_ENCODED_ERROR_SCHEMA = Schema.object({
  errorKind: Schema.literal('generic'),
  bundleId: Schema.literal(...TRANSLATION_BUNDLE_IDS),
  titleKey: Schema.string,
  subtitleKey: Schema.string,
  detailsKey: Schema.optional(Schema.string),
  context: Schema.optional(SUBSTITUTION_CONTEXT_SCHEMA),
})

export type IGenericEncodedError = Infer<typeof GENERIC_ENCODED_ERROR_SCHEMA>

export interface ITranslatedGenericEncodedError {
  errorKind: 'generic'
  title: string
  message: string
  details?: string
}

export const HTTP_ENCODED_ERROR_SCHEMA = Schema.union(
  Schema.object({
    errorKind: Schema.literal('http'),
    code: Schema.literal(400, 403, 404, 500, 502),
    details: Schema.optional(
      Schema.object({
        key: Schema.string,
        bundleId: Schema.literal(...TRANSLATION_BUNDLE_IDS),
        context: Schema.optional(SUBSTITUTION_CONTEXT_SCHEMA),
      }),
    ),
  }),
)

export type IHttpEncodedError = Infer<typeof HTTP_ENCODED_ERROR_SCHEMA>
export type HttpErrorCode = IHttpEncodedError['code']

export interface ITranslatedHttpEncodedError {
  errorKind: 'http'
  code: HttpErrorCode
  details?: string
}

export const ENCODED_ERROR_SCHEMA = Schema.union(GENERIC_ENCODED_ERROR_SCHEMA, HTTP_ENCODED_ERROR_SCHEMA)

export type IEncodedError = IGenericEncodedError | IHttpEncodedError
export type ITranslatedEncodedError = ITranslatedGenericEncodedError | ITranslatedHttpEncodedError
export type PresentableErrorKind = IEncodedError['errorKind']

export interface PresentableErrorTranslationKeys {
  bundleId: TranslationBundleId
  titleKey: string
  subtitleKey: string
  detailsKey?: string
}

export interface PresentableErrorMessages {
  title: string
  message: string
  cause?: string
}
