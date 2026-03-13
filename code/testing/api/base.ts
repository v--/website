import { type APIRequestContext, request } from '@playwright/test'

import { BASE_URL } from './config.ts'
import { type IFinalizeable } from '../../common/types/finalizable.ts'
import { encodePreferenceHeader } from '../../server/http/preferences.ts'

interface IBaseApiClientOptions {
  httpHeaders?: Record<string, string>
}

interface IApiRequestOptions {
  rawErrorResponse: boolean
}

const PREFERENCE_HEADER_OPTIONS = { 'data-source': 'mocked' }

export class BaseApiClient implements IFinalizeable {
  protected _context: APIRequestContext

  static async initialize<ClientT extends BaseApiClient>(options?: IBaseApiClientOptions): Promise<ClientT> {
    const context = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        prefer: encodePreferenceHeader(PREFERENCE_HEADER_OPTIONS),
        ...options?.httpHeaders,
      },
    })

    return new this(context) as ClientT
  }

  protected constructor(context: APIRequestContext) {
    this._context = context
  }

  get(url: string, options?: IApiRequestOptions) {
    const reqOptions = options && {
      headers: {
        prefer: encodePreferenceHeader({
          ...PREFERENCE_HEADER_OPTIONS,
          'error-response': options.rawErrorResponse ? 'raw' : 'translated',
        }),
      },
    }

    return this._context.get(url, reqOptions)
  }

  async reset() {}

  async finalize() {
    await this._context.dispose()
  }
}
