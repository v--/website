import { type WebsiteEnvironment } from '../../common/environment.ts'
import { c } from '../../common/rendering/component.ts'
import { renderToString } from '../../common/rendering/static_render.ts'
import { type uint32 } from '../../common/types/numbers.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'
import { root } from '../components/root.ts'
import { encodeRehydrationData } from '../rehydration.ts'

export class ServerResponse {
  readonly content: string
  readonly mimeType: string
  readonly code: uint32

  static async json(contents: unknown, code: uint32 = 200) {
    return new this(JSON.stringify(contents), 'application/json', code)
  }

  static async page(pageState: IWebsitePageState, code: uint32 = 200, env: WebsiteEnvironment) {
    const rehydrationData = await encodeRehydrationData(pageState, env)
    const component = c(root, { pageState, rehydrationData })
    const rendered = await renderToString(component, env)
    await component.finalize()

    return new this(
      '<!DOCTYPE html>' + rendered,
      'text/html',
      code,
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
