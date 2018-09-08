import { CoolError } from '../../common/errors.mjs'

export class DividedDifferencesError extends CoolError {}
export class NoPointsError extends DividedDifferencesError {}
export class DuplicatePointsError extends DividedDifferencesError {}
