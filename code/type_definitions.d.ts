/* eslint-disable no-restricted-syntax */

declare module 'gulp-svgo' {
  export default function (): NodeJS.ReadWriteStream
}

declare module 'gulp-dart-sass' {
  export default function (options: { outputStyle: 'compressed' }): NodeJS.ReadWriteStream
}

declare module 'gulp-terser' {
  export default function (options?: unknown): NodeJS.ReadWriteStream
}

declare module 'gulp-sourcemaps' {
  class Interface {
    static init(options?: unknown): NodeJS.ReadWriteStream
    static write(options?: string): NodeJS.ReadWriteStream
  }

  export default Interface
}

declare module 'es-observable-tests' {
  class API {
    static runTests(_observable: unknown): void
  }

  export default API
}
