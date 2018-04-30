export default class Path {
  constructor (raw) {
    this.raw = raw
    this.segments = raw.split('/').filter(Boolean)
    this.cooked = '/' + this.segments.join('/')

    const queryStringMatch = raw.match(/\?(.*)$/)
    const queryString = queryStringMatch === null ? '' : queryStringMatch[1]

    this.query = new Map(queryString.split('&').map(tuple => tuple.split('=', 2)))
  }

  toString () {
    return this.cooked
  }
}
