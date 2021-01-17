import { uint32 } from './types/numeric.js'

Error.stackTraceLimit = Number.POSITIVE_INFINITY

export const errorClassIds = ['HTTPError', 'ClientError', 'CoolError', 'DataFormatError'] as const
export type ErrorClassId = typeof errorClassIds[number]

export interface ErrorJsonObject {
  classId: ErrorClassId
  message: string
  title?: string
  code?: uint32
}

export class CoolError extends Error {
  title?: string
  message: string

  static fromJSON({ message }: ErrorJsonObject) {
    return new this(message)
  }

  constructor(message?: string) {
    super(message)
    this.message = message || ''
  }

  toString() {
    return this.message
  }

  toJSON(): ErrorJsonObject {
    return {
      classId: this.classId,
      message: this.message
    }
  }

  get classId(): ErrorClassId {
    return 'CoolError'
  }

  static assert(value: unknown, message: string) {
    if (!value) {
      throw new this(message)
    }
  }

  static isDisplayable(err: Error) {
    return err instanceof CoolError &&
      typeof err.title === 'string' &&
      typeof err.message === 'string'
  }
}

export class NotImplementedError extends CoolError {}

export class ClientError extends CoolError {
  title: string

  static fromJSON({ message, title }: ErrorJsonObject) {
    return new this(message, title)
  }

  constructor(message: string, title = 'Error') {
    super(message)
    this.title = title
  }

  toJSON(): ErrorJsonObject {
    return {
      classId: this.classId,
      title: this.title,
      message: this.message
    }
  }

  get classId(): ErrorClassId {
    return 'ClientError'
  }
}

export class HTTPError extends ClientError {
  static fromJSON({ code, title }: ErrorJsonObject) {
    return new this(code!, title!)
  }

  constructor(
    public code: uint32,
    public title: string
  ) {
    super(`HTTP Error ${code}: ${title}`)
  }

  toJSON(): ErrorJsonObject {
    return {
      classId: this.classId,
      code: this.code,
      title: this.title,
      message: this.message
    }
  }

  get classId(): ErrorClassId {
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
  static fromJSON({ message }: ErrorJsonObject) {
    return new this(message)
  }

  toJSON(): ErrorJsonObject {
    return {
      classId: this.classId,
      message: this.message
    }
  }

  get classId(): ErrorClassId {
    return 'DataFormatError'
  }
}

// This is for restoring server errors that do not have their class id set
export class GenericError extends CoolError {}
