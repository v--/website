declare namespace TResolution {
  export type TokenType =
    'whitespace' |
    'naturalNumber' |
    'variable' |
    'function' |
    'functionName' |
    'predicateName' |
    'predicate' |
    'negation' |
    'term' |
    'arguments' |
    'formula' |
    'universalQuantification' |
    'existentialQuantification' |
    'conjunction' |
    'disjunction' |
    'implication' |
    'equivalence' |
    'connectiveFormula' |
    'topLevelFormula'

  export type ExpressionType =
    'variable' |
    'function' |
    'predicate' |
    'negation' |
    'universalQuantification' |
    'existentialQuantification' |
    'conjunction' |
    'disjunction' |
    'implication' |
    'equivalence'

  export type NameMap = Map<string, TResolution.Term>

  export interface VariableExpression {
    type: 'variable'
    name: string
  }

  export interface FunctionExpression<T = Term> {
    type: 'function'
    name: string
    args: T[]
  }

  export interface PredicateExpression {
    type: 'predicate'
    name: string
    args: Term[]
  }

  export interface NegationExpression<T = Formula> {
    type: 'negation'
    formula: T
  }

  export interface QuantificationExpression<T = Formula> {
    type: 'universalQuantification' | 'existentialQuantification'
    variable: string
    formula: T
  }

  export interface ConjunctionExpression<T = Formula> {
    type: 'conjunction'
    formulas: T[]
  }

  export interface DisjunctionExpression<T = Formula> {
    type: 'disjunction'
    formulas: T[]
  }

  export interface ImplicationExpression<T = Formula> {
    type: 'implication'
    formulas: T[]
  }

  export interface EquivalenceExpression<T = Formula> {
    type: 'equivalence'
    formulas: T[]
  }

  export type Term = VariableExpression | FunctionExpression
  export type AtomicFormula = PredicateExpression
  export type Formula = AtomicFormula | NegationExpression | QuantificationExpression | ConjunctionExpression | DisjunctionExpression | ImplicationExpression | EquivalenceExpression
  export type Expression = Term | Formula

  export type SimplifiedInnerFormula = AtomicFormula | NegationExpression<SimplifiedInnerFormula> | QuantificationExpression<SimplifiedInnerFormula> | DisjunctionExpression<SimplifiedInnerFormula>
  export type SimplifiedFormula = ConjunctionExpression<SimplifiedFormula> | SimplifiedInnerFormula

  export type PNFInnerFormula = AtomicFormula | NegationExpression<PNFInnerFormula> | DisjunctionExpression<PNFInnerFormula>
  export type PNFFormula = QuantificationExpression<PNFFormula> | ConjunctionExpression<SNFInnerFormula> | PNFInnerFormula

  export type SNFQuantifierFormula = QuantificationExpression<SNFFormula> & { type: 'universalQuantification' }
  export type SNFInnerFormula = AtomicFormula | NegationExpression<SNFInnerFormula> | DisjunctionExpression<SNFInnerFormula>
  export type SNFFormula = SNFQuantifierFormula | ConjunctionExpression<SNFInnerFormula> | SNFInnerFormula

  export type Literal = AtomicFormula | NegationExpression<AtomicFormula>
  export type Disjunct = Literal[]

  export interface Resolvent {
    index: number
    disjunct: Disjunct
    r1?: Resolvent
    r2?: Resolvent
    literal?: Literal
  }
}
