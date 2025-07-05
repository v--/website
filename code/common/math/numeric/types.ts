import { type IMathMLEntry } from '../../rich.ts'

export interface ISymbolicFunction<T, R = T> {
  eval(arg: T): R
  getRichTextEntry(): IMathMLEntry
}
