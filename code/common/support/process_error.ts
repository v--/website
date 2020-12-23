import { ClientError, DataFormatError, ErrorClassId, errorClassIds, ErrorJsonObject, GenericError, HTTPError } from '../errors.js'
import { processDatum } from '../types/processing.js'

export const processErrorJsonObject = processDatum<ErrorJsonObject>(({
  classId, message, title, code
}) => {
  if ((typeof classId === 'string' && errorClassIds.includes(classId as ErrorClassId)) &&
    typeof message === 'string' &&
    (title === undefined || typeof title === 'string') &&
    (code === undefined || typeof code === 'number')) {

    return {
      classId: classId as ErrorClassId,
      message,
      title,
      code
    }
  }
})

export function restoreError(data: ErrorJsonObject) {
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
