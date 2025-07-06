export const EXTENDABLE_FUNCTION_CALL = Symbol('call')

/*
 * A base class that supports "call" signatures.
 *
 * An implementing class must simply pass its call method when calling `super`.
 *
 * Based on https://stackoverflow.com/a/36871498/2756776
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class ExtendableFunction<T extends unknown[], R> extends Function {
  // @ts-expect-error
  constructor(f: (...args: T) => R) {
    return Object.setPrototypeOf(f, new.target.prototype)
  }
}

export interface ExtendableFunction<T extends unknown[], R> {
  (...args: T): R
}
