import { IntegrityError } from '../errors.ts'
import { zipLongest } from './iteration.ts'
import { type uint32 } from '../types/numbers.ts'

export class Path {
  readonly segments: string[]
  readonly prefixSlash: boolean

  static parse(raw: string): Path {
    return new this(
      raw.split('/').filter(Boolean),
      raw.startsWith('/'),
    )
  }

  constructor(segments: string[], prefixSlash: boolean) {
    this.segments = segments
    this.prefixSlash = prefixSlash
  }

  isEmpty() {
    return this.segments.length === 0
  }

  matchPrefix(...segments: string[]) {
    if (this.segments.length < segments.length) {
      return false
    }

    for (let i = 0; i < segments.length; i++) {
      if (this.segments[i] !== segments[i]) {
        return false
      }
    }

    return true
  }

  matchFull(...segments: string[]) {
    if (this.segments.length > segments.length) {
      return false
    }

    return this.matchPrefix(...segments)
  }

  pushLeft(...segments: string[]) {
    return new Path(
      [...segments, ...this.segments],
      this.prefixSlash,
    )
  }

  popLeft(count: uint32 = 1) {
    return new Path(
      this.segments.slice(count),
      this.prefixSlash,
    )
  }

  pushRight(...segments: string[]) {
    return new Path(
      [...this.segments, ...segments],
      this.prefixSlash,
    )
  }

  popRight(count: uint32 = 1) {
    return new Path(
      this.segments.slice(0, this.segments.length - count),
      this.prefixSlash,
    )
  }

  getBaseName() {
    if (this.isEmpty()) {
      throw new IntegrityError('Cannot get the base name of an empty path')
    }

    return this.segments[this.segments.length - 1]
  }

  equals(other: Path) {
    for (const [a, b] of zipLongest(this.segments, other.segments)) {
      if (a !== b) {
        return false
      }
    }

    return true
  }

  toString() {
    return (this.prefixSlash ? '/' : '') + this.segments.join('/')
  }
}
