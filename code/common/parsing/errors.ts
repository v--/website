import { CoolError } from '../errors.ts'

export class BaseParsingError extends CoolError {}
export class ParserError extends BaseParsingError {}
export class InvalidTokenError extends BaseParsingError {}
export class TokenizerError extends BaseParsingError {}
