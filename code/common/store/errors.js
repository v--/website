import { ClientError, DataFormatError, errorClassIds, GenericError, HTTPError } from '../errors.js'
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
