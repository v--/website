import { CoolError } from '../../../common/errors.ts'

export class DomError extends CoolError {}
export class MissingElementError extends DomError {}
export class InvalidElementError extends DomError {}
