import { CoolError } from '../errors.ts'

export class FormattingError extends CoolError {}
export class MissingFieldError extends FormattingError {}
