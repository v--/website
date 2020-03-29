export class Path {
  static parse (raw) {
    const [url, rawQuery = ''] = decodeURI(raw).split('?', 2)
    const segments = url.split('/').filter(Boolean)
    const query = new Map(rawQuery
      .split('&')
      .map(tuple => tuple.split('=', 2))
      .filter(tuple => Boolean(tuple[1])))

    for (const [key, value] of query.entries()) {
      query.set(key, value.replace('%24', '&'))
    }

    return new this(segments, query)
  }

  constructor (segments, query) {
    this.segments = segments
    this.query = query
  }

  clone () {
    return new this.constructor(
      this.segments.slice(),
      new Map(this.query)
    )
  }

  getParentPath () {
    return new this.constructor(
      this.segments.slice(0, this.segments.length - 1),
      new Map(this.query)
    )
  }

  join (segment) {
    return new Path(this.segments.concat(segment), this.query)
  }

  get underCooked () {
    return '/' + this.segments.join('/')
  }

  get cooked () {
    if (this.query.size > 0) {
      return this.underCooked + '?' + Array.from(this.query.entries())
        .map(([key, value]) => `${key}=${value.replace('&', '%24')}`)
        .sort()
        .join('&')
    } else {
      return this.underCooked
    }
  }

  get parent () {
    const s = this.segments
    return new Path(s.slice(0, s.length - 1), this.query)
  }
}
