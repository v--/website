export default class Path {
  constructor (raw) {
    const [url, query = ''] = raw.split('?', 2)
    this.raw = raw
    this.segments = url.split('/').filter(Boolean)
    this.cooked = '/' + this.segments.join('/')

    this.query = new Map(query
      .split('&')
      .map(tuple => tuple.split('=', 2))
      .filter(tuple => Boolean(tuple[1])))
  }

  toString () {
    return this.cooked
  }
}
