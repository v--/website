export { PresentableError } from './presentable_errors/errors.ts'
export { translateEncoding } from './presentable_errors/translation.ts'
export {
  ENCODED_ERROR_SCHEMA,
  GENERIC_ENCODED_ERROR_SCHEMA,
  HTTP_ENCODED_ERROR_SCHEMA,
  type HttpErrorCode,
  type IEncodedError,
  type IGenericEncodedError,
  type IHttpEncodedError,
  type ITranslatedEncodedError,
  type ITranslatedGenericEncodedError,
  type ITranslatedHttpEncodedError,
  type PresentableErrorKind,
  type PresentableErrorMessages,
  type PresentableErrorTranslationKeys,
} from './presentable_errors/types.ts'
