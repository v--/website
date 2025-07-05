import { MathError } from '../errors.ts'

export class NumericError extends MathError {}

export class DimensionError extends NumericError {}
export class DimensionMismatchError extends DimensionError {}

export class KnotError extends NumericError {}
export class KnotExistenceError extends KnotError {}
export class KnotUniquenessError extends KnotError {}
