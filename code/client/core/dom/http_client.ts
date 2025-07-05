import { CacheMissError } from '../../../common/cache/errors.ts'
import { CoolError } from '../../../common/errors.ts'
import { type HttpErrorCode, PresentableError, type PresentableErrorFactory } from '../../../common/presentable_errors.ts'
import { type UrlPath } from '../../../common/support/url_path.ts'

export class HttpClientError extends CoolError {}

export class HttpClient {
  readonly errorFactory: PresentableErrorFactory

  constructor(errorFactory: PresentableErrorFactory) {
    this.errorFactory = errorFactory
  }

  createHttpError(code: HttpErrorCode): PresentableError {
    try {
      return this.errorFactory.create({ errorKind: 'http', code })
    } catch (err) {
      if (err instanceof CacheMissError) {
        throw new HttpClientError(`An HTTP ${code} error occurred but the presentable error factory has not yet been properly initialized.`)
      }

      throw err
    }
  }

  async fetchJson(urlPath: UrlPath) {
    let response: Response

    try {
      response = await window.fetch(urlPath.toString())
    } catch (err) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        throw this.errorFactory.create({
          errorKind: 'generic',
          bundleId: 'core_error',
          titleKey: 'error.title.timeout',
          messageKey: 'error.message.timeout',
        })
      }

      throw err
    }

    switch (response.status) {
      case 200:
        return response.json()

      case 403:
        throw this.createHttpError(403)

      case 404:
        throw this.createHttpError(404)

      case 502:
        throw this.createHttpError(502)

      default:
        throw this.createHttpError(500)
    }
  }
}
