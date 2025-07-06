import { Path } from './path.ts'

const DEFAULT_QUERY = new Map<string, string>()

export class UrlPath {
  readonly path: Path
  readonly query: Map<string, string>

  static parse(raw: string): UrlPath {
    let url: string
    let rawQuery: string

    try {
      const decodedURL = decodeURI(raw).split('?', 2)
      url = decodedURL[0]
      rawQuery = decodedURL[1] || ''
    } catch (err) {
      if (err instanceof URIError) {
        return new this(Path.parse(raw), new Map())
      }

      throw err
    }

    const path = Path.parse(url)
    const query = new Map(
      rawQuery
        .split('&')
        .map(tuple => tuple.split('=', 2) as [string, string])
        .filter(tuple => Boolean(tuple[1])),
    )

    for (const [key, value] of query.entries()) {
      query.set(key, value.replace('%24', '&'))
    }

    return new this(path, query)
  }

  constructor(path: Path, query = DEFAULT_QUERY) {
    this.path = path
    this.query = query
  }

  trimQueryString() {
    return new UrlPath(this.path)
  }

  getQueryString() {
    return Array.from(this.query.entries())
      .map(([key, value]) => `${key}=${value.replace('&', '%24')}`)
      .sort()
      .join('&')
  }

  toString() {
    const base = this.path.toString()

    if (this.query.size === 0) {
      return base
    }

    return base + '?' + this.getQueryString()
  }
}
