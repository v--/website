import { CoolError } from '../errors.js'
import { Optional } from '../types/typecons.js'
import { repr } from './strings.js'

export class ParserError extends CoolError {}

type ParserRef = number // A simple way to match all enum values
type RuleMap = Record<ParserRef, ParserRule>

export type RefType = ParserRule | ParserRef

interface IParserMatch {
  matches: string[]
  tail: string
}

export type IParseTree = {
  type: ParserRef
  matches: ParseTree[]
}

export type ParseTree = string | IParseTree

function findRule(rules: RuleMap, rule: ParserRule | ParserRef): ParserRule {
  if (rule instanceof ParserRule) {
    return rule
  }

  if (rules[rule]) {
    return rules[rule]
  }

  throw new ParserError('Unknown rule ' + repr(rule))
}

function addMatch(rule: RefType, originalMatches: (IParseTree | string)[], newMatches: string[]): void {
  if (rule instanceof ParserRule) {
    originalMatches.push(...newMatches)
  } else {
    originalMatches.push({
      type: rule,
      matches: newMatches
    })
  }
}

export abstract class ParserRule {
  abstract parse(rules: RuleMap, string: string): Optional<IParserMatch>
}

export class WildcardRule extends ParserRule {
  parse(_rules: RuleMap, string: string) {
    return {
      matches: string ? [string[0]] : [],
      tail: string.slice(1)
    }
  }
}

export const wildcard = new WildcardRule()

export class TerminalRule extends ParserRule {
  constructor(
    public terminals: string[]
  ) {
    super()
  }

  parse(_rules: RuleMap, string: string) {
    for (const terminal of this.terminals) {
      const n = terminal.length

      if (terminal === string.slice(0, n)) {
        return {
          matches: [terminal],
          tail: string.slice(n)
        }
      }
    }
  }
}

export function term(...terminals: string[]) {
  return new TerminalRule(terminals)
}

export class NegationRule extends ParserRule {
  constructor(
    public terminals: string[]
  ) {
    super()
  }

  parse(_rules: RuleMap, string: string) {
    let maxN = 0

    for (const terminal of this.terminals) {
      const n = terminal.length

      if (n > maxN) {
        maxN = n
      }

      if (terminal === string.slice(0, n)) {
        return
      }
    }

    return {
      matches: string ? [string[0]] : [],
      tail: string.slice(1)
    }
  }
}

export function neg(...terminals: string[]) {
  return new NegationRule(terminals)
}

export class OptionalRule extends ParserRule {
  constructor(
    public subrule: RefType
  ) {
    super()
  }

  parse(rules: RuleMap, string: string) {
    const matches: string[] = []
    const result = findRule(rules, this.subrule).parse(rules, string)

    if (result) {
      addMatch(this.subrule, matches, result.matches)
      return { matches, tail: result.tail }
    } else {
      return { matches: [], tail: string }
    }
  }
}

export function opt(subrule: RefType) {
  return new OptionalRule(subrule)
}

export class RepetitionRule extends ParserRule {
  constructor(
    public subrule: RefType
  ) {
    super()
  }

  parse(rules: RuleMap, string: string) {
    const rule = findRule(rules, this.subrule)
    const matches: string[] = []
    let tail = string
    let result = rule.parse(rules, string)

    while (result) {
      addMatch(this.subrule, matches, result.matches)
      tail = result.tail
      result = result.tail.length === 0 ? undefined : rule.parse(rules, tail)
    }

    return { matches, tail }
  }
}

export function rep(subrule: RefType) {
  return new RepetitionRule(subrule)
}

export class ConcatenationRule extends ParserRule {
  constructor(
    public subrules: RefType[]
  ) {
    super()
  }

  parse(rules: RuleMap, string: string) {
    const matches: string[] = []
    let tail = string

    for (const _rule of this.subrules) {
      const rule = findRule(rules, _rule)
      const result = rule.parse(rules, tail)

      if (result) {
        addMatch(_rule, matches, result.matches)
        tail = result.tail
      } else {
        return 
      }
    }

    return { matches, tail }
  }
}

export function cat(...subrules: RefType[]) {
  return new ConcatenationRule(subrules)
}

export class AlternationRule extends ParserRule {
  constructor(
    public subrules: RefType[]
  ) {
    super()
  }

  parse(rules: RuleMap, string: string) {
    for (const _rule of this.subrules) {
      const rule = findRule(rules, _rule)
      const result = rule.parse(rules, string)

      if (result) {
        const matches: string[] = []
        addMatch(_rule, matches, result.matches)
        return { matches, tail: result.tail }
      }
    }

    return 
  }
}

export function alt(...subrules: RefType[]) {
  return new AlternationRule(subrules)
}

export function parse(rules: RuleMap, initialRuleRef: ParserRef, string: string): IParseTree {
  if (!Object.prototype.hasOwnProperty.call(rules, initialRuleRef)) {
    throw new ParserError('Unknown initial rule ' + repr(initialRuleRef))
  }

  const result = rules[initialRuleRef].parse(rules, string)

  if (result === undefined) {
    throw new ParserError('Unable to parse ' + repr(string))
  }

  if (string !== '' && result.tail !== '') {
    throw new ParserError('Unable to fully parse ' + repr(string) + ' because of the leftover string ' + repr(result.tail))
  }

  return { type: initialRuleRef, matches: result.matches }
}
