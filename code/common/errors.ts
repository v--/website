/**
 * Root class for all custom errors
 */
export abstract class CoolError extends Error {
  declare readonly message: string
  declare readonly cause?: unknown

  constructor(message?: string, cause?: unknown) {
    const options: ErrorOptions = {}

    if (cause !== undefined) {
      options.cause = cause
    }

    super(message, options)
    this.message = message ?? ''

    if (cause !== undefined) {
      this.cause = cause
    }
  }

  toString() {
    return this.message
  }
}

/**
 * Class for unexpected errors that result from bugs rather than bad user input.
 * For errors resulting from invalid data, consider using ValidationError.
 */
export class IntegrityError extends CoolError {}

/**
 * Class for unimplemented functionality not enforceable by TypeScript
 */
export class NotImplementedError extends IntegrityError {}
