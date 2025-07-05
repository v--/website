import { CoolError } from '../../common/errors.ts'

export class BreakoutError extends CoolError {}
export class BreakoutBrickError extends BreakoutError {}
export class BreakoutReflectionError extends BreakoutError {}
