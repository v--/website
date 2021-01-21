declare namespace TParsing {
  type ParserRef = string // A simple way to match all enum values
  type RuleMap = Record<ParserRef, IParserRule>

  export type RefType = IParserRule | ParserRef

  interface IParserMatch {
    matches: string[]
    tail: string
  }

  export type IParseTree = {
    type: ParserRef
    matches: ParseTree[]
  }

  export type ParseTree = string | IParseTree

  export interface IParserRule {
    parse(rules: RuleMap, string: string): IParserMatch | undefined
  }
}
