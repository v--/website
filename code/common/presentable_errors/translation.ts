import { GetText } from '../translation.ts'
import { type IEncodedError, type ITranslatedEncodedError, type ITranslatedGenericEncodedError, type ITranslatedHttpEncodedError } from './types.ts'

export function translateEncoding(gettext: GetText, encoded: IEncodedError): ITranslatedEncodedError {
  switch (encoded.errorKind) {
    case 'http': {
      const result: ITranslatedHttpEncodedError = {
        errorKind: 'http',
        code: encoded.code,
      }

      if (encoded.details) {
        result.details = gettext.plain(encoded.details)
      }

      return result
    }

    case 'generic': {
      const result: ITranslatedGenericEncodedError = {
        errorKind: 'generic',
        title: gettext.plain({ bundleId: encoded.bundleId, key: encoded.titleKey }),
        message: gettext.plain({ bundleId: encoded.bundleId, key: encoded.subtitleKey }),
      }

      if (encoded.detailsKey) {
        result.details = gettext.plain({ bundleId: encoded.bundleId, key: encoded.detailsKey })
      }

      return result
    }
  }
}
