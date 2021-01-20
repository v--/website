import { ClientError, DataFormatError, errorClassIds, GenericError, HTTPError } from '../errors.js'
import { processDatum } from './processing.js'

export const processErrorJsonObject = processDatum(
  /**
   * @returns {Errors.ErrorJsonObject | undefined}
   */
  ({ classId, message, title, code }) => {
    if ((typeof classId === 'string' && errorClassIds.includes(/** @type {Errors.ErrorClassId} */ (classId))) &&
      typeof message === 'string' &&
      (title === undefined || typeof title === 'string') &&
      (code === undefined || typeof code === 'number')) {

      return {
        classId: /** @type {Errors.ErrorClassId} */ (classId),
        message,
        title,
        code
      }
    }
  }
)

/**
 * @param {Errors.ErrorJsonObject} data
 */
export function restoreError(data) {
  switch (data.classId) {
    case 'HTTPError':
      return HTTPError.fromJSON(data)

    case 'ClientError':
      return ClientError.fromJSON(data)

    case 'DataFormatError':
      return DataFormatError.fromJSON(data)

    case 'CoolError':
    default:
      return GenericError.fromJSON(data)
  }
}
