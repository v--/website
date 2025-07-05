import { type IRichTextEntry } from './types.ts'
import { IntegrityError } from '../errors.ts'
import { isClose, isZero, stringifyNumber } from '../support/floating.ts'
import { zip } from '../support/iteration.ts'
import { type float64 } from '../types/numbers.ts'

// We define several types to easy defining MathML entries within the code.
// We do not enforce these types in the schema since typing the entirety of MathML would require considerable effort,
// and we want to support whatever comes out of tex4ht
export type IMathMLEntry =
  IRichTextEntry & { kind: 'mathml', children?: IMathMLEntry[] }

export type IMathMLRootEntry =
  IMathMLEntry & { tag: 'math', children: IMathMLEntry[] }

export type IMathMLRow =
  IMathMLEntry & { tag: 'mrow', children: IMathMLEntry[] }

export type IMathMLSpace =
  IMathMLEntry & { tag: 'mspace' }

export type IMathMLNumber =
  IMathMLEntry & { tag: 'mn', text: string }

export type IMathMLIdentifier =
  IMathMLEntry & { tag: 'mi', text: string }

export type IMathMLOperator =
  IMathMLEntry & { tag: 'mo', text: string }

export type IMathMLSup =
  IMathMLEntry & { tag: 'msup', children: [IMathMLEntry, IMathMLEntry] }

export type IMathMLTable =
  IMathMLEntry & { tag: 'mtable', children: IMathMLTableRow[] }

export type IMathMLTableRow =
  IMathMLEntry & { tag: 'mrow', children: IMathMLTableCell[] }

export type IMathMLTableCell =
  IMathMLEntry & { tag: 'mtd', children: IMathMLEntry[] }

export class MathMLHelper {
  root(display: 'block' | 'inline', ...entries: IMathMLEntry[]): IMathMLRootEntry {
    const attributes: Record<string, string> = {}

    switch (display) {
      case 'block':
      case 'inline':
        attributes.display = display
        break
    }

    return { kind: 'mathml', tag: 'math', children: entries, attributes }
  }

  row(...entries: IMathMLEntry[]): IMathMLRow {
    return { kind: 'mathml', tag: 'mrow', children: entries }
  }

  newline(): IMathMLSpace {
    return { kind: 'mathml', tag: 'mspace', attributes: { linebreak: 'newline' } }
  }

  space(attributes: Partial<Record<'depth' | 'height' | 'width', string>>): IMathMLSpace {
    return { kind: 'mathml', tag: 'mspace', attributes }
  }

  thinmuskip(): IMathMLSpace {
    // Based on https://tex.stackexchange.com/a/74354
    return this.space({ width: (1 / 6) + 'em' })
  }

  number(num: float64 | string): IMathMLNumber {
    const text = typeof num === 'string' ? num : stringifyNumber(num)
    return { kind: 'mathml', tag: 'mn', text }
  }

  identifier(name: string, kind?: 'upright'): IMathMLIdentifier {
    const attributes: Record<string, string> = {}

    switch (kind) {
      case 'upright':
        attributes.mathvariant = 'normal'
        break
    }

    return { kind: 'mathml', tag: 'mi', text: name, attributes }
  }

  operator(symbol: string, kind?: 'prefix' | 'postfix' | 'separator'): IMathMLOperator {
    const attributes: Record<string, string> = {}

    switch (kind) {
      case 'prefix':
        attributes.form = 'prefix'
        attributes.stretchy = 'false'
        break

      case 'postfix':
        attributes.form = 'postfix'
        attributes.stretchy = 'false'
        break

      case 'separator':
        attributes.separator = 'true'
        break
    }

    return { kind: 'mathml', tag: 'mo', text: symbol, attributes }
  }

  sup(base: IMathMLEntry, superscript: IMathMLEntry): IMathMLSup {
    return {
      kind: 'mathml',
      tag: 'msup',
      children: [base, superscript],
    }
  }

  table(...rows: IMathMLTableRow[]): IMathMLTable {
    return {
      kind: 'mathml',
      tag: 'mtable',
      children: rows,
    }
  }

  tableRow(...cells: IMathMLTableCell[]): IMathMLTableRow {
    return {
      kind: 'mathml',
      tag: 'mrow',
      children: cells,
    }
  }

  tableCell(...children: IMathMLEntry[]): IMathMLTableCell {
    return {
      kind: 'mathml',
      tag: 'mtd',
      children: children,
    }
  }

  linearCombination(coeff: float64[], entries: Array<IMathMLEntry | undefined>, delimiter?: IRichTextEntry): IMathMLRow {
    if (coeff.length !== entries.length) {
      throw new IntegrityError('Mismatch between the coefficients and vectors of a linear combination')
    }

    const result = this.row()

    for (const [c, entry] of zip(coeff, entries)) {
      if (isZero(c)) {
        continue
      }

      if (c < 0) {
        result.children.push(this.operator('-'))
      } else if (result.children.length > 0) {
        result.children.push(this.operator('+'))
      }

      const cString = stringifyNumber(Math.abs(c))

      if (entry) {
        if (!isClose(c, 1) && !isClose(c, -1)) {
          result.children.push(
            this.number(cString.includes('e') ? '(' + cString + ')' : cString),
          )

          if (delimiter) {
            result.children.push(delimiter)
          }
        }

        result.children.push(entry)
      } else {
        result.children.push(this.number(cString))
      }
    }

    if (result.children.length === 0) {
      result.children.push(this.number('0'))
    }

    return result
  }

  * #iterFunctionApplicationArgs(argLists: Array<Array<IMathMLEntry>>): Generator<IMathMLEntry> {
    for (let i = 0; i < argLists.length; i++) {
      const args = argLists[i]

      for (let j = 0; j < args.length; j++) {
        yield args[j]

        if (j + 1 < args.length) {
          yield this.operator(',', 'separator')
        }
      }

      if (i + 1 < argLists.length) {
        yield this.operator(';', 'separator')
      }
    }
  }

  functionApplication(name: IMathMLIdentifier, ...argLists: Array<Array<IMathMLEntry>>): IMathMLEntry {
    const args = Array.from(this.#iterFunctionApplicationArgs(argLists))

    if (args.length === 0) {
      return this.row(name)
    }

    return this.row(
      name,
      this.operator('(', 'prefix'),
      ...args,
      this.operator(')', 'postfix'),
    )
  }
}

export const mathml = new MathMLHelper()
