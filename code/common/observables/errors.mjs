import { CoolError } from '../errors.mjs'

export class ObservableError extends CoolError {}

// Allow the error class to be modified to allow of the observable tests to pass
export default {
  ErrorClass: ObservableError
}

