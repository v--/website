import { CoolError, NotImplementedError } from '../errors.js'
import { repr } from './strings.js'

export class ParserError extends CoolError {}

export class ParserRule {
  findRule (rules, rule) {
    if (rule instanceof ParserRule) {
      return rule
    }

    if (rules[rule]) {
      return rules[rule]
    }

    throw new ParserError('Unknown rule ' + repr(rule))
  }

  addMatch (rule, originalMatches, newMatches) {
    if (rule instanceof ParserRule) {
      originalMatches.push(...newMatches)
    } else {
      originalMatches.push({
        type: rule,
        matches: newMatches
      })
    }
  }

  _parse () {
    throw new NotImplementedError()
  }
}

export class WildcardRule extends ParserRule {
  _parse (rules, string) {
    return {
      matches: string ? [string[0]] : [],
      tail: string.slice(1)
    }
  }
}

export const wildcard = new WildcardRule()

export class TerminalRule extends ParserRule {
  constructor (terminals) {
    super()
    this.terminals = terminals
  }

  _parse (rules, string) {
    for (const terminal of this.terminals) {
      const n = terminal.length

      if (terminal === string.slice(0, n)) {
        return {
          matches: [terminal],
          tail: string.slice(n)
        }
      }
    }

    return null
  }
}

export function term (...terminals) {
  return new TerminalRule(terminals)
}

export class NegationRule extends ParserRule {
  constructor (terminals) {
    super()
    this.terminals = terminals
  }

  _parse (rules, string) {
    let maxN = 0

    for (const terminal of this.terminals) {
      const n = terminal.length

      if (n > maxN) {
        maxN = n
      }

      if (terminal === string.slice(0, n)) {
        return null
      }
    }

    return {
      matches: string ? [string[0]] : [],
      tail: string.slice(1)
    }
  }
}

export function neg (...terminals) {
  return new NegationRule(terminals)
}

export class OptionalRule extends ParserRule {
  constructor (subrule) {
    super()
    this._subrule = subrule
  }

  _parse (rules, string) {
    const matches = []
    const result = this.findRule(rules, this._subrule)._parse(rules, string)

    if (result) {
      this.addMatch(this._subrule, matches, result.matches)
      return { matches, tail: result.tail }
    } else {
      return { matches: [], tail: string }
    }
  }
}

export function opt (subrule) {
  return new OptionalRule(subrule)
}

export class RepetitionRule extends ParserRule {
  constructor (subrule) {
    super()
    this._subrule = subrule
  }

  _parse (rules, string) {
    const rule = this.findRule(rules, this._subrule)
    const matches = []
    let tail = string
    let result = rule._parse(rules, string)

    while (result) {
      this.addMatch(this._subrule, matches, result.matches)
      tail = result.tail
      result = result.tail.length === 0 ? null : rule._parse(rules, tail)
    }

    return { matches, tail }
  }
}

export function rep (subrule) {
  return new RepetitionRule(subrule)
}

export class ConcatenationRule extends ParserRule {
  constructor (subrules) {
    super()
    this._subrules = subrules
  }

  _parse (rules, string) {
    const matches = []
    let tail = string

    for (const _rule of this._subrules) {
      const rule = this.findRule(rules, _rule)
      const result = rule._parse(rules, tail)

      if (result) {
        this.addMatch(_rule, matches, result.matches)
        tail = result.tail
      } else {
        return null
      }
    }

    return { matches, tail }
  }
}

export function cat (...subrules) {
  return new ConcatenationRule(subrules)
}

export class AlternationRule extends ParserRule {
  constructor (subrules) {
    super()
    this._subrules = subrules
  }

  _parse (rules, string) {
    for (const _rule of this._subrules) {
      const rule = this.findRule(rules, _rule)
      const result = rule._parse(rules, string)

      if (result) {
        const matches = []
        this.addMatch(_rule, matches, result.matches)
        return { matches, tail: result.tail }
      }
    }

    return null
  }
}

export function alt (...subrules) {
  return new AlternationRule(subrules)
}

export function parse (rules, initialRuleName, string) {
  if (!Object.prototype.hasOwnProperty.call(rules, initialRuleName)) {
    throw new ParserError('Unknown initial rule ' + repr(initialRuleName))
  }

  const result = rules[initialRuleName]._parse(rules, string)

  if (result === null) {
    throw new ParserError('Unable to parse ' + repr(string))
  }

  if (string !== '' && result.tail !== '') {
    throw new ParserError('Unable to fully parse ' + repr(string) + ' because of the leftover string ' + repr(result.tail))
  }

  return { type: initialRuleName, matches: result.matches }
}
