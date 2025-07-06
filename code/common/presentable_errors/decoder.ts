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

  getSubtitleSpec(): ITranslationSpec {
    switch (this.encoded.errorKind) {
      case 'generic':
        return {
          bundleId: this.encoded.bundleId,
          key: this.encoded.subtitleKey,
        }

      case 'http':
        return {
          bundleId: 'core_error',
          key: 'error.subtitle.http',
          context: { code: this.encoded.code },
        }
    }
  }

  getDetailsSpec(): ITranslationSpec | undefined {
    switch (this.encoded.errorKind) {
      case 'generic':
        if (this.encoded.detailsKey) {
          return {
            bundleId: this.encoded.bundleId,
            key: this.encoded.detailsKey,
          }
        }

        return undefined

      case 'http':
        return this.encoded.details
    }
  }

  getBundleIds(): TranslationBundleId[] {
    switch (this.encoded.errorKind) {
      case 'generic':
        return [this.encoded.bundleId]

      case 'http':
        if (this.encoded.details && this.encoded.details.bundleId !== 'core_error') {
          return ['core_error', this.encoded.details.bundleId]
        }

        return ['core_error']
    }
  }
}
