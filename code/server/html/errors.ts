import { CoolError } from '../../common/errors.ts'

export class HtmlError extends CoolError {}
export class NoHtmlBodyError extends CoolError {}
export class UnsupportedHtmlError extends HtmlError {}
