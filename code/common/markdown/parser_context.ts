import { type MarkdownToken, type MarkdownTokenKind } from './tokens.ts'
import { ParserContext } from '../parsing/parser_context.ts'

export class MarkdownParserContext extends ParserContext<MarkdownTokenKind, MarkdownToken> {}
