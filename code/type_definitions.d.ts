/* eslint-disable no-restricted-syntax */

declare module 'gulp-svgo' {
  export default function (): NodeJS.ReadWriteStream
}

declare module 'gulp-dart-sass' {
  export default function (options: { outputStyle: 'compressed' }): NodeJS.ReadWriteStream
}

declare module 'es-observable-tests' {
  class API {
    static runTests(_observable: unknown): void
  }

  export default API
}
