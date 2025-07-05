import { CoolError } from '../errors.ts'

export class SchemaError extends CoolError {}

/**
 * Class for unexpected errors that result from invalid data rather than code bugs.
 * For errors resulting from misbehaving core, consider using IntegrityError.
 */
export class ValidationError extends CoolError {}

interface SchemaValidationErrorCause {
  value: unknown
  schema: string
}

export class SchemaValidationError extends ValidationError {
  declare cause: SchemaValidationErrorCause

  constructor(message: string, cause: SchemaValidationErrorCause) {
    super(message, cause)
  }
}
