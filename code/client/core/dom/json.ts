import { ENCODED_ERROR_SCHEMA, type IEncodedError, PresentableError } from '../../../common/presentable_errors.ts'
import { type UrlPath } from '../../../common/support/url_path.ts'
import { validateSchema } from '../../../common/validation.ts'

export async function fetchJson(urlPath: UrlPath) {
  let response: Response

  try {
    response = await window.fetch(urlPath.toString(), {
      headers: { prefer: 'error-response=raw' },
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new PresentableError(
        {
          errorKind: 'generic',
          bundleId: 'core',
          titleKey: 'error.title.timeout',
          subtitleKey: 'error.subtitle.timeout',
        },
        'HTTP request timeout',
      )
    }

    throw err
  }

  let encodedError: IEncodedError | undefined = undefined

  try {
    const json = await response.json()

    if (response.status === 200) {
      return json
    } else {
      try {
        encodedError = validateSchema(ENCODED_ERROR_SCHEMA, json)
      } catch (err) { /* empty */ }
    }
  } catch (err) { /* empty */ }

  if (encodedError) {
    throw new PresentableError(encodedError)
  }

  switch (response.status) {
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
