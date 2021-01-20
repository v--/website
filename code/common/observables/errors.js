import { CoolError } from '../errors.js'

export class ObservableError extends CoolError {}

/**
 * Allow the error class to be modified to allow of the observable tests to pass
 * @type {{ ErrorClass: TypeCons.Constructor<[string], Error> }}
 */
export const errors = {
  ErrorClass: ObservableError
}
