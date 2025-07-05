import { type APIRequestContext, request } from '@playwright/test'

import { type IFinalizeable } from '../../common/types/finalizable.ts'
import { BASE_URL } from './config.ts'

interface IBaseApiClientOptions {
  httpHeaders?: Record<string, string>
}

export class BaseApiClient implements IFinalizeable {
  protected _context: APIRequestContext

  static async initialize<ClientT extends BaseApiClient>(options?: IBaseApiClientOptions): Promise<ClientT> {
    const context = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { prefer: 'data-source=mocked', ...options?.httpHeaders },
    })

    return new this(context) as ClientT
  }

  protected constructor(context: APIRequestContext) {
    this._context = context
  }

  get(url: string) {
    return this._context.get(url)
  }

  async reset() {}

  async finalize() {
    await this._context.dispose()
  }
}
