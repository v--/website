export class CoolError extends Error {
  static fromJSON ({ message }) {
    return new this(message)
  }

  constructor (message) {
    super(message)
    this.message = message
  }

  toString () {
    return this.message
  }

  toJSON () {
    return {
      classId: this.classId,
      message: this.message
    }
  }

  get classId () {
    return 'CoolError'
  }

  static assert (value, message) {
    if (!value) {
      throw new this(message)
    }
  }

  static isDisplayable (err) {
    return err instanceof CoolError &&
      typeof err.title === 'string' &&
      typeof err.message === 'string'
  }
}

export class NotImplementedError extends CoolError {}

export class ClientError extends CoolError {
  static fromJSON ({ message, title }) {
    return new this(message, title)
  }

  constructor (message, title = 'Error') {
    super(message)
    this.title = title
  }

  toJSON () {
    return {
      classId: this.classId,
      title: this.title,
      message: this.message
    }
  }

  get classId () {
    return 'ClientError'
  }
}

export class HTTPError extends ClientError {
  static fromJSON ({ code, title }) {
    return new this(code, title)
  }

  constructor (code, title) {
    super(`HTTP Error ${code}: ${title}`)
    this.code = code
    this.title = title
  }

  toJSON () {
    return {
      classId: this.classId,
      code: this.code,
      title: this.title
    }
  }

  get classId () {
    return 'HTTPError'
  }
}

export class NotFoundError extends HTTPError {
  constructor () {
    super(404, 'Resource not found')
  }
}

// This is for restoring server errors that do not have their class id set
export class GenericError extends CoolError {}
