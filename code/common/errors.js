// @ts-check

Error.stackTraceLimit = Number.POSITIVE_INFINITY

/** @typedef { import('./types/numeric').uint32 } uint32 */

/**
 * @typedef {'HTTPError' | 'ClientError' | 'CoolError' | 'DataFormatError'} ErrorClassId
 */

/** @type {ErrorClassId[]} */
export const errorClassIds = ['HTTPError', 'ClientError', 'CoolError', 'DataFormatError']

/**
 * @typedef {object} ErrorJsonObject
 * @property {ErrorClassId} classId
 * @property {string} message
 * @property {string=} title
 * @property {uint32=} code
 */

export class CoolError extends Error {
  /**
   * @param {ErrorJsonObject} json
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
   * @returns {ErrorJsonObject}
   */
  toJSON() {
    return {
      classId: this.classId,
      message: this.message
    }
  }

  /**
   * @returns {ErrorClassId}
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

  /**
   * @param {Error} err
   */
  static isDisplayable(err) {
    return err instanceof CoolError &&
      typeof err.title === 'string' &&
      typeof err.message === 'string'
  }
}

export class NotImplementedError extends CoolError {}

export class ClientError extends CoolError {
  /**
   * @param {ErrorJsonObject} json
   */
  static fromJSON({ message, title }) {
    return new this(message, title)
  }

  /**
   * @param {string} message
   * @param {string} title
   */
  constructor(message, title = 'Error') {
    super(message)
    this.title = title
  }

  /**
   * @returns {ErrorJsonObject}
   */
  toJSON() {
    return {
      classId: this.classId,
      title: this.title,
      message: this.message
    }
  }

  /**
   * @returns {ErrorClassId}
   */
  get classId() {
    return 'ClientError'
  }
}

export class HTTPError extends ClientError {
  /**
   * @param {ErrorJsonObject} json
   */
  static fromJSON({ code = 400, title = 'Bad Request' }) {
    return new this(code, title)
  }

  /**
   * @param {uint32} code
   * @param {string} title
   */
  constructor(code, title) {
    super(`HTTP Error ${code}: ${title}`)
    this.code = code
    this.title = title
  }

  /**
   * @returns {ErrorJsonObject}
   */
  toJSON() {
    return {
      classId: this.classId,
      code: this.code,
      title: this.title,
      message: this.message
    }
  }

  /**
   * @returns {ErrorClassId}
   */
  get classId() {
    return 'HTTPError'
  }
}

export class NotFoundError extends HTTPError {
  constructor() {
    super(404, 'Resource not found')
  }
}

export class ForbiddenError extends HTTPError {
  constructor() {
    super(403, 'Forbidden')
  }
}

export class DataFormatError extends CoolError {
  /**
   * @param {ErrorJsonObject} json
   */
  static fromJSON({ message }) {
    return new this(message)
  }

  /**
   * @returns {ErrorJsonObject}
   */
  toJSON() {
    return {
      classId: this.classId,
      message: this.message
    }
  }

  /**
   * @returns {ErrorClassId}
   */
  get classId() {
    return 'DataFormatError'
  }
}

// This is for restoring server errors that do not have their class id set
export class GenericError extends CoolError {}
