export class CoolError extends Error {
  constructor (message) {
    super(message)
    this.message = message
  }

  toString () {
    return this.message
  }

  toJSON () {
    return {
      message: this.message
    }
  }

  static assert (value, message) {
    if (!value) {
      throw new this(message)
    }
  }
}

export class ClientError extends CoolError {
  constructor (message) {
    super(message)
    this.title = 'Error'
  }

  toJSON () {
    return {
      title: this.title,
      message: this.message
    }
  }
}

export class HTTPError extends CoolError {
  constructor (code, title, viewID) {
    super(`HTTP Error ${code}: ${title}`)
    this.code = code
    this.title = title

    if (viewID) {
      this.viewID = viewID
    }
  }

  toJSON () {
    return {
      code: this.code,
      title: this.title,
      viewID: this.viewID
    }
  }
}

export class NotFoundError extends HTTPError {
  constructor (viewID) {
    super(404, 'Resource not found', viewID)
  }
}
