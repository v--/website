import { EncodedErrorDecoder } from './decoder.ts'
import { PresentableError } from './errors.ts'
import { type IEncodedError, type ITranslatedEncodedError } from './types.ts'
import { type Cache } from '../cache.ts'
import { type ITranslationMapLabel } from '../services.ts'
import { type ITranslationMap } from '../translation/types.ts'
import { type ITranslationSpec, type LanguageId, gettext } from '../translation.ts'

export const EXCEPTION_INSTANCE_LANGUAGE: LanguageId = 'en'

export class PresentableErrorFactory {
  readonly cache: Cache<ITranslationMapLabel, ITranslationMap>

  constructor(cache: Cache<ITranslationMapLabel, ITranslationMap>) {
    this.cache = cache
  }

  #translateSpec(spec: ITranslationSpec): string {
    const translationMap = this.cache.getCachedValue({ bundleId: spec.bundleId, languageId: EXCEPTION_INSTANCE_LANGUAGE })
    return gettext({
      translationMap,
      key: spec.key,
      options: { coerce: true },
      context: spec.context,
    })
  }

  translateEncoding(encoded: IEncodedError): ITranslatedEncodedError {
    const decoder = new EncodedErrorDecoder(encoded)
    const causeSpec = decoder.getCauseSpec()
    const cause = causeSpec && this.#translateSpec(causeSpec)

    switch (encoded.errorKind) {
      case 'generic':
        return {
          errorKind: 'generic',
          title: this.#translateSpec(decoder.getTitleSpec()),
          message: this.#translateSpec(decoder.getMessageSpec()),
          cause,
        }

      case 'http':
        return {
          errorKind: 'http',
          code: encoded.code,
          cause,
        }
    }
  }

  create(encoded: IEncodedError): PresentableError {
    const decoder = new EncodedErrorDecoder(encoded)
    const causeSpec = decoder.getCauseSpec()
    const cause = causeSpec && this.#translateSpec(causeSpec)

    return new PresentableError(
      encoded,
      this.#translateSpec(decoder.getTitleSpec()),
      this.#translateSpec(decoder.getMessageSpec()),
      cause,
    )
  }
}
