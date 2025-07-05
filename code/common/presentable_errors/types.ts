import { TRANSLATION_BUNDLE_IDS, type TranslationBundleId } from '../types/bundles.ts'
import { type Infer, Schema } from '../validation.ts'

export const GENERIC_ENCODED_ERROR_SCHEMA = Schema.object({
  errorKind: Schema.literal('generic'),
  bundleId: Schema.literal(...TRANSLATION_BUNDLE_IDS),
  titleKey: Schema.string,
  messageKey: Schema.string,
  causeKey: Schema.optional(Schema.string),
  context: Schema.optional(Schema.record(Schema.string)),
})

export type IGenericEncodedError = Infer<typeof GENERIC_ENCODED_ERROR_SCHEMA>

export interface ITranslatedGenericEncodedError {
  errorKind: 'generic'
  title: string
  message: string
  cause?: string
}

export const HTTP_ENCODED_ERROR_SCHEMA = Schema.union(
  Schema.object({
    errorKind: Schema.literal('http'),
    code: Schema.literal(400, 403, 404, 500),
    cause: Schema.optional(
      Schema.object({
        key: Schema.string,
        bundleId: Schema.literal(...TRANSLATION_BUNDLE_IDS),
        context: Schema.optional(
          Schema.record(
            Schema.union(Schema.string, Schema.int32),
          ),
        ),
      }),
    ),
  }),
)

export type IHttpEncodedError = Infer<typeof HTTP_ENCODED_ERROR_SCHEMA>
export type HttpErrorCode = IHttpEncodedError['code']

export interface ITranslatedHttpEncodedError {
  errorKind: 'http'
  code: HttpErrorCode
  cause?: string
}

export const ENCODED_ERROR_SCHEMA = Schema.union(GENERIC_ENCODED_ERROR_SCHEMA, HTTP_ENCODED_ERROR_SCHEMA)

export type IEncodedError = IGenericEncodedError | IHttpEncodedError
export type ITranslatedEncodedError = ITranslatedGenericEncodedError | ITranslatedHttpEncodedError
export type PresentableErrorKind = IEncodedError['errorKind']

export interface PresentableErrorTranslationKeys {
  bundleId: TranslationBundleId
  titleKey: string
  messageKey: string
  causeKey?: string
}

export interface PresentableErrorMessages {
  title: string
  message: string
  cause?: string
}
