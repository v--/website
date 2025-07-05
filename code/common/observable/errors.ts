import { CoolError } from '../errors.ts'

export class ObservableError extends CoolError {}

interface ErrorMap {
  // It is difficult to satisfy the ErrorConstructor interface, so we use a union type with our error class
  ErrorClass: ErrorConstructor | typeof ObservableError
}

export const errors: ErrorMap = {
  ErrorClass: ObservableError,
}
