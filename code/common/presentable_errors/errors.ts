import { CoolError } from '../errors.ts'
import { type IEncodedError } from './types.ts'

/**
 * Class for errors that can be shown to the user, and also serialized and deserialized
 */
export class PresentableError extends CoolError {
  declare readonly cause?: string
  declare readonly message: string
  readonly title: string
  readonly encoded: IEncodedError

  constructor(encoded: IEncodedError, title: string, message: string, cause?: string) {
    super(message, cause)
    this.title = title
    this.encoded = encoded
  }
}
