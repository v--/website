declare namespace TErrors {
  type ErrorClassId = 'HTTPError' | 'ClientError' | 'CoolError' | 'DataFormatError'

  interface ErrorJsonObject {
   classId: ErrorClassId
   message: string
   title?: string
   code?: TNum.UInt32
  }
}
