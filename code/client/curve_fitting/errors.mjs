import { CoolError } from '../../common/errors'

export class DividedDifferencesError extends CoolError {}
export class NoPointsError extends DividedDifferencesError {}
export class DuplicatePointsError extends DividedDifferencesError {}
