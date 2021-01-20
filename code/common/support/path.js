export class Path {
  /**
   * @param {string} raw
   * @returns {Path}
   */
  static parse(raw) {
    const [url, rawQuery = ''] = decodeURI(raw).split('?', 2)
    const segments = url.split('/').filter(Boolean)
    const query = new Map(rawQuery
      .split('&')
      .map(tuple => /** @type {[string, string]} */ (tuple.split('=', 2)))
      .filter(tuple => Boolean(tuple[1])))

    for (const [key, value] of query.entries()) {
      query.set(key, value.replace('%24', '&'))
    }

    return new this(segments, query)
  }

  /**
   * @param {string[]} segments
   * @param {Map<string, string>} query
   */
  constructor(segments, query) {
    this.segments = segments
    this.query = query
  }

  clone() {
    return new Path(
      this.segments.slice(),
      new Map(this.query)
    )
  }

  getParentPath() {
    return new Path(
      this.segments.slice(0, this.segments.length - 1),
      new Map()
    )
  }

  /**
   * @param {string} segment
   */
  join(segment) {
    return new Path(this.segments.concat(segment), this.query)
  }

  get underCooked() {
    return '/' + this.segments.join('/')
  }

  get queryString() {
    return Array.from(this.query.entries())
      .map(([key, value]) => `${key}=${value.replace('&', '%24')}`)
      .sort()
      .join('&')
  }

  get cooked() {
    if (this.query.size > 0) {
      return this.underCooked + '?' + this.queryString
    } else {
      return this.underCooked
    }
  }
}
