Error.stackTraceLimit = Number.POSITIVE_INFINITY

/** @type {TErrors.ErrorClassId[]} */
export const errorClassIds = ['HTTPError', 'PresentableError', 'CoolError', 'DataFormatError']

export class CoolError extends Error {
  /**
   * @param {TErrors.ErrorJsonObject} json
   */
  static fromJSON({ message }) {
    return new this(message)
  }

  /**
   * @param {string} message
   */
  constructor(message) {
    super(message)
    this.message = message || ''

    /** @type {string=} */
    this.title = undefined
  }

  toString() {
    return this.message
  }

  /**
   * @returns {TErrors.ErrorJsonObject}
   */
  toJSON() {
    return {
      classId: this.classId,
      message: this.message
    }
  }

  /**
   * @returns {TErrors.ErrorClassId}
   */
  get classId() {
    return 'CoolError'
  }

  /**
   * @param {unknown} value
   * @param {string} message
   */
  static assert(value, message) {
    if (!value) {
      throw new this(message)
    }
  }
}

export class NotImplementedError extends CoolError {
  /**
   * @param {string} [message]
   */
  constructor(message) {
    super(message || 'Not implemented')
  }
}

export class PresentableError extends CoolError {
  /**
   * @param {TErrors.ErrorJsonObject} json
   */
  static fromJSON({ message, title }) {
    return new this(message, title)
  }

  /**
   * @param {string} message
   * @param {string} title
   */
  constructor(title = 'Error', message = 'An unknown error occurred') {
    super(message)
    this.title = title
  }

  /**
   * @returns {TErrors.ErrorJsonObject}
   */
  toJSON() {
    return {
      classId: this.classId,
      title: this.title,
      message: this.message
    }
  }

  /**
   * @returns {TErrors.ErrorClassId}
   */
  get classId() {
    return 'PresentableError'
  }
}

export class HTTPError extends PresentableError {
  /**
   * @param {TErrors.ErrorJsonObject} json
   */
  static fromJSON({ code = 500, message }) {
    return new this(code, message)
  }

  /**
   * @param {TNum.UInt32} code
   * @param {string} message
   */
  constructor(code, message) {
    super(`HTTP Error ${code}`, message)
    this.code = code
  }

  /**
   * @returns {TErrors.ErrorJsonObject}
   */
  toJSON() {
    return {
      classId: this.classId,
      code: this.code,
      message: this.message
    }
  }

  /**
   * @returns {TErrors.ErrorClassId}
   */
  get classId() {
    return 'HTTPError'
  }
}

export class BadRequestError extends HTTPError {
  /**
   * @param {TErrors.ErrorJsonObject} json
   */
  static fromJSON({ message }) {
    return new this(message)
  }

  /**
   * @param {string} message
   */
  constructor(message = 'Bad request') {
    super(400, message)
  }
}

export class ForbiddenError extends HTTPError {
  /**
   * @param {TErrors.ErrorJsonObject} json
   */
  static fromJSON({ message }) {
    return new this(message)
  }

  /**
   * @param {string} message
   */
  constructor(message = 'Forbidden') {
    super(403, message)
  }
}

export class NotFoundError extends HTTPError {
  /**
   * @param {TErrors.ErrorJsonObject} json
   */
  static fromJSON({ message }) {
    return new this(message)
  }

  /**
   * @param {string} message
   */
  constructor(message = 'Resource not found') {
    super(404, message)
  }
}

export class InternalServerError extends HTTPError {
  /**
   * @param {TErrors.ErrorJsonObject} json
   */
  static fromJSON({ message }) {
    return new this(message)
  }

  /**
   * @param {string} message
   */
  constructor(message = 'Internal server error') {
    super(500, message)
  }
}

export class DataFormatError extends CoolError {
  /**
   * @param {TErrors.ErrorJsonObject} json
   */
  static fromJSON({ message }) {
    return new this(message)
  }

  /**
   * @returns {TErrors.ErrorJsonObject}
   */
  toJSON() {
    return {
      classId: this.classId,
      message: this.message
    }
  }

  /**
   * @returns {TErrors.ErrorClassId}
   */
  get classId() {
    return 'DataFormatError'
  }
}

// This is for restoring server errors that do not have their class id set
export class GenericError extends CoolError {}
