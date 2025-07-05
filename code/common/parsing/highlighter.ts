/**
 * Port of https://github.com/v--/notebook/blob/master/code/notebook/parsing/highlighter.py
 */

import { IntegrityError } from '../errors.ts'
import { join } from '../support/strings.ts'
import { type uint32 } from '../types/numbers.ts'

const CHAR_MARKER = '^'
const CHAR_LINENO_SEP = '│'
const CHAR_LINE_BREAK = '↵'

interface ISourcePosition {
  offset: uint32
  lineno: uint32
  column: uint32
}

interface IErrorHighlighterConfig {
  source: string
  offsetHiStart: uint32
  offsetHiEnd: uint32
  offsetShownStart?: uint32
  offsetShownEnd?: uint32
}

export class ErrorHighlighter {
  posHiStart: ISourcePosition
  posHiEnd: ISourcePosition

  posShownStart: ISourcePosition
  posShownEnd: ISourcePosition

  linesShown: Array<string>

  constructor(
    {
      source,
      offsetHiStart, offsetHiEnd,
      offsetShownStart, offsetShownEnd,
    }: IErrorHighlighterConfig,
  ) {
    if (offsetShownStart === undefined) {
      offsetShownStart = offsetHiStart
    }

    if (offsetShownEnd === undefined) {
      offsetShownEnd = offsetHiEnd
    }

    if (offsetShownStart > offsetHiStart || offsetHiStart > offsetHiEnd || offsetHiEnd > offsetShownEnd || offsetShownEnd > source.length) {
      throw new IntegrityError('Invalid error highlighting configuration')
    }

    let lineno = 1
    let column = 1
    let line_start_offset = 0
    const linesShown: string[] = []

    this.linesShown = linesShown

    this.posHiStart = { offset: 0, lineno: 1, column: 1 }
    this.posHiEnd = { offset: 0, lineno: 1, column: 1 }
    this.posShownStart = { offset: 0, lineno: 1, column: 1 }
    this.posShownEnd = { offset: 0, lineno: 1, column: 1 }

    for (let offset = 0; offset < source.length; offset++) {
      const char = source[offset]

      if (offset === offsetHiStart) {
        this.posHiStart = { offset, lineno, column }
      }

      if (offset === offsetHiEnd) {
        this.posHiEnd = { offset, lineno, column }
      }

      if (offset === offsetShownStart) {
        this.posShownStart = { offset, lineno, column }
      }

      if (offset === offsetShownEnd) {
        this.posShownEnd = { offset, lineno, column }
      }

      if (char === '\n') {
        if (offset >= offsetShownStart) {
          linesShown.push(source.slice(line_start_offset, offset + 1))
        }

        lineno += 1
        column = 1
        line_start_offset = offset + 1

        if (offset >= offsetShownEnd && lineno > this.posShownEnd.lineno) {
          break
        }
      } else {
        column += 1
      }
    }

    if (lineno <= this.posShownEnd.lineno) {
      linesShown.push(source.slice(line_start_offset))
    }
  }

  * #iterHighlighted(): Iterable<string> {
    let lineno = this.posShownStart.lineno
    const lineno_prefix_length = String(this.posShownEnd.lineno).length

    for (const line of this.linesShown) {
      yield String(lineno).padStart(lineno_prefix_length)
      yield ' ' + CHAR_LINENO_SEP + ' '

      if (line[line.length - 1] === '\n') {
        yield line.slice(0, -1) + CHAR_LINE_BREAK
      } else {
        yield line
      }

      yield '\n'

      if (this.posHiStart.lineno <= lineno && lineno <= this.posHiEnd.lineno) {
        const col = lineno === this.posHiStart.lineno ? this.posHiStart.column : 1
        const lastCol = lineno === this.posHiEnd.lineno ? this.posHiEnd.column : line.length

        yield ' '.repeat(lineno_prefix_length + 1)
        yield CHAR_LINENO_SEP
        yield ' '.repeat(col)
        yield CHAR_MARKER.repeat(1 + (lastCol - col))
        yield '\n'
      }

      lineno += 1
    }
  }

  highlight(): string {
    return join(this.#iterHighlighted(), '')
  }
}
