import { type ITranslationSpec } from '../translation.ts'
import { type IEncodedError } from './types.ts'
import { type TranslationBundleId } from '../types/bundles.ts'

export class EncodedErrorDecoder {
  readonly encoded: IEncodedError

  constructor(encoded: IEncodedError) {
    this.encoded = encoded
  }

  getTitleSpec(): ITranslationSpec {
    switch (this.encoded.errorKind) {
      case 'generic':
        return {
          bundleId: this.encoded.bundleId,
          key: this.encoded.titleKey,
        }

      case 'http':
        return {
          bundleId: 'core_error',
          key: `error.title.http.${this.encoded.code}`,
        }
    }
  }

  getMessageSpec(): ITranslationSpec {
    switch (this.encoded.errorKind) {
      case 'generic':
        return {
          bundleId: this.encoded.bundleId,
          key: this.encoded.messageKey,
        }

      case 'http':
        return {
          bundleId: 'core_error',
          key: 'error.message.http',
          context: { code: this.encoded.code },
        }
    }
  }

  getCauseSpec(): ITranslationSpec | undefined {
    switch (this.encoded.errorKind) {
      case 'generic':
        if (this.encoded.causeKey) {
          return {
            bundleId: this.encoded.bundleId,
            key: this.encoded.causeKey,
          }
        }

        return undefined

      case 'http':
        return this.encoded.cause
    }
  }

  getBundleIds(): TranslationBundleId[] {
    switch (this.encoded.errorKind) {
      case 'generic':
        return [this.encoded.bundleId]

      case 'http':
        if (this.encoded.cause && this.encoded.cause.bundleId !== 'core_error') {
          return ['core_error', this.encoded.cause.bundleId]
        }

        return ['core_error']
    }
  }
}
