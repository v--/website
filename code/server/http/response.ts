import { createComponent as c } from '../../common/rendering/component.ts'
import { renderToString } from '../../common/rendering/static_render.ts'
import { type uint32 } from '../../common/types/numbers.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { root } from '../components/root.ts'
import { type ServerWebsiteEnvironment } from '../environment.ts'
import { encodeRehydrationData } from '../rehydration.ts'

interface IServerResponseOptions {
  mimeType?: string
  code?: uint32
}

export class ServerResponse {
  readonly content: string
  readonly mimeType: string
  readonly code: uint32

  static async json(contents: unknown, options?: IServerResponseOptions) {
    return new this(
      JSON.stringify(contents),
      options?.mimeType || 'application/json', options?.code || 200,
    )
  }

  static async page(pageState: IWebsitePageState, env: ServerWebsiteEnvironment, options?: IServerResponseOptions) {
    const rehydrationData = await encodeRehydrationData(pageState, env)
    const component = c.factory(root, { pageState, rehydrationData })
    const rendered = await renderToString(component, env)
    await component.finalize()

    return new this(
      '<!DOCTYPE html>' + rendered,
      options?.mimeType || 'text/html',
      options?.code || 200,
    )
  }

  constructor(
    content: string,
    mimeType: string,
    code: uint32 = 200,
  ) {
    this.content = content
    this.mimeType = mimeType
    this.code = code
  }
}
