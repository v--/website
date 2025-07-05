import { CoolError } from '../errors.ts'

export class RichTextError extends CoolError {}
export class SubstitutionError extends RichTextError {}
