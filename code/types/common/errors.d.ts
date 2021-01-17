declare namespace Errors {
  type ErrorClassId = 'HTTPError' | 'ClientError' | 'CoolError' | 'DataFormatError'

  interface ErrorJsonObject {
   classId: ErrorClassId
   message: string
   title?: string
   code?: Num.UInt32
  }
}
