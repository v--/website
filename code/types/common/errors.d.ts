declare namespace TErrors {
  type ErrorClassId = 'HTTPError' | 'PresentableError' | 'CoolError' | 'DataFormatError'

  interface ErrorJsonObject {
   classId: ErrorClassId
   message: string
   title?: string
   subtitle?: string
   code?: TNum.UInt32
  }
}
