import { CoolError } from '../errors'
import { repr } from './strings.js'

export class ParserError extends CoolError {}

/**
 * @param {TParsing.RuleMap} rules
 * @param {TParsing.IParserRule | TParsing.ParserRef} rule
 * @returns {TParsing.IParserRule}
 */
function findRule(rules, rule) {
  if (typeof rule === 'string') {
    if (rules[rule]) {
      return rules[rule]
    }

    throw new ParserError('Unknown rule ' + repr(rule))
  }

  return rule
}

/**
 * @param {TParsing.RefType} rule
 * @param {(TParsing.IParseTree | string)[]} originalMatches
 * @param {string[]} newMatches
 * @returns {void}
 */
function addMatch(rule, originalMatches, newMatches) {
  if (typeof rule === 'string') {
    originalMatches.push({
      type: rule,
      matches: newMatches
    })
  } else {
    originalMatches.push(...newMatches)
  }
}

/**
 * @implements TParsing.IParserRule
 */
export class WildcardRule {
  /**
   * @param {TParsing.RuleMap} _rules
   * @param {string} string
   */
  parse(_rules, string) {
    return {
      matches: string ? [string[0]] : [],
      tail: string.slice(1)
    }
  }
}

export const wildcard = new WildcardRule()

/**
 * @implements TParsing.IParserRule
 */
export class TerminalRule {
  /** @param {string[]} terminals */
  constructor(terminals) {
    this.terminals = terminals
  }

  /**
   * @param {TParsing.RuleMap} _rules
   * @param {string} string
   */
  parse(_rules, string) {
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

/** @param {string[]} terminals */
export function term(...terminals) {
  return new TerminalRule(terminals)
}

/**
 * @implements TParsing.IParserRule
 */
export class NegationRule {
  /** @param {string[]} terminals */
  constructor(terminals) {
    this.terminals = terminals
  }

  /**
   * @param {TParsing.RuleMap} _rules
   * @param {string} string
   */
  parse(_rules, string) {
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

/** @param {string[]} terminals */
export function neg(...terminals) {
  return new NegationRule(terminals)
}

/**
 * @implements TParsing.IParserRule
 */
export class OptionalRule {
  /** @param {TParsing.RefType} subrule */
  constructor(subrule) {
    this.subrule = subrule
  }

  /**
   * @param {TParsing.RuleMap} rules
   * @param {string} string
   */
  parse(rules, string) {
    /** @type {string[]} */
    const matches = []
    const result = findRule(rules, this.subrule).parse(rules, string)

    if (result) {
      addMatch(this.subrule, matches, result.matches)
      return { matches, tail: result.tail }
    } else {
      return { matches: [], tail: string }
    }
  }
}

/** @param {TParsing.RefType} subrule */
export function opt(subrule) {
  return new OptionalRule(subrule)
}

/**
 * @implements TParsing.IParserRule
 */
export class RepetitionRule {
  /** @param {TParsing.RefType} subrule */
  constructor(subrule) {
    this.subrule = subrule
  }

  /**
   * @param {TParsing.RuleMap} rules
   * @param {string} string
   */
  parse(rules, string) {
    const rule = findRule(rules, this.subrule)

    /** @type {string[]} */
    const matches = []

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

/** @param {TParsing.RefType} subrule */
export function rep(subrule) {
  return new RepetitionRule(subrule)
}

/**
 * @implements TParsing.IParserRule
 */
export class ConcatenationRule {
  /** @param {TParsing.RefType[]} subrules */
  constructor(subrules) {
    this.subrules = subrules
  }

  /**
   * @param {TParsing.RuleMap} rules
   * @param {string} string
   */
  parse(rules, string) {
    /** @type {string[]} */
    const matches = []
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

/** @param {TParsing.RefType[]} subrules */
export function cat(...subrules) {
  return new ConcatenationRule(subrules)
}

/**
 * @implements TParsing.IParserRule
 */
export class AlternationRule {
  /** @param {TParsing.RefType[]} subrules */
  constructor(subrules) {
    this.subrules = subrules
  }

  /**
   * @param {TParsing.RuleMap} rules
   * @param {string} string
   */
  parse(rules, string) {
    for (const _rule of this.subrules) {
      const rule = findRule(rules, _rule)
      const result = rule.parse(rules, string)

      if (result) {
        /** @type {string[]} */
        const matches = []
        addMatch(_rule, matches, result.matches)
        return { matches, tail: result.tail }
      }
    }

    return 
  }
}

/** @param {TParsing.RefType[]} subrules */
export function alt(...subrules) {
  return new AlternationRule(subrules)
}

/**
 * @param {TParsing.RuleMap} rules
 * @param {TParsing.ParserRef} initialRuleRef
 * @param {string} string
 * @returns {TParsing.IParseTree}
 */
export function parse(rules, initialRuleRef, string) {
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
