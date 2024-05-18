import { PresentableError, DataFormatError, errorClassIds, GenericError, HTTPError, BadRequestError, ForbiddenError, NotFoundError, InternalServerError } from '../errors'
import { processDatum } from './processing.js'

export const processErrorJsonObject = processDatum(
  /**
   * @returns {TErrors.ErrorJsonObject | undefined}
   */
  ({ classId, message, title, code }) => {
    if ((typeof classId === 'string' && errorClassIds.includes(/** @type {TErrors.ErrorClassId} */ (classId))) &&
      typeof message === 'string' &&
      (title === undefined || typeof title === 'string') &&
      (code === undefined || typeof code === 'number')) {

      return {
        classId: /** @type {TErrors.ErrorClassId} */ (classId),
        message,
        title,
        code
      }
    }
  }
)

/**
 * @param {TErrors.ErrorJsonObject} data
 */
export function restoreError(data) {
  switch (data.classId) {
    case 'HTTPError':
      switch (data.code) {
        case 400: return BadRequestError.fromJSON(data)
        case 403: return ForbiddenError.fromJSON(data)
        case 404: return NotFoundError.fromJSON(data)
        case 500: return InternalServerError.fromJSON(data)
        default: return HTTPError.fromJSON(data)
      }

    case 'PresentableError':
      return PresentableError.fromJSON(data)

    case 'DataFormatError':
      return DataFormatError.fromJSON(data)

    case 'CoolError':
    default:
      return GenericError.fromJSON(data)
  }
}
