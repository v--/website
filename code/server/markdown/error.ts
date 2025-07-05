import { CoolError } from '../../common/errors.ts'

export class MarkdownError extends CoolError {}
export class UnsupportedMarkdownError extends MarkdownError {}
