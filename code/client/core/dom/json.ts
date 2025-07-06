import { PresentableError } from '../../../common/presentable_errors.ts'
import { type UrlPath } from '../../../common/support/url_path.ts'

export async function fetchJson(urlPath: UrlPath) {
  let response: Response

  try {
    response = await window.fetch(urlPath.toString())
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new PresentableError(
        {
          errorKind: 'generic',
          bundleId: 'core_error',
          titleKey: 'error.title.timeout',
          subtitleKey: 'error.subtitle.timeout',
        },
        'HTTP request timeout',
      )
    }

    throw err
  }

  switch (response.status) {
    case 200:
      return response.json()

    case 403:
      throw new PresentableError({ errorKind: 'http', code: 403 })

    case 404:
      throw new PresentableError({ errorKind: 'http', code: 404 })

    case 502:
      throw new PresentableError({ errorKind: 'http', code: 502 })

    default:
      throw new PresentableError({ errorKind: 'http', code: 500 })
  }
}
