import { CoolError } from '../errors.ts'
import { type IEncodedError } from './types.ts'

/**
 * Class for errors that can be shown to the user, and also serialized and deserialized
 */
export class PresentableError extends CoolError {
  declare readonly cause: IEncodedError
  declare readonly message: string

  constructor(encoded: IEncodedError, message?: string) {
    if (message === undefined) {
      message = encoded.errorKind === 'http' ? `HTTP error ${encoded.code}` : 'Client-facing error'
    }

    super(message, encoded)
  }
}
