import { CoolError } from '../../../common/errors.ts'
import { repr } from '../../../common/support/strings.ts'
import { type PlaygroundPageId } from '../../../common/types/bundles.ts'
import { type WebsitePage } from '../../../common/types/page.ts'

/**
 * As per the MDN documentation [1], "the module namespace object is a sealed object with null prototype".
 * I doubt that there is a better way to represent it in TypeScript
 *
 * [1] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object
 */
type JavaScriptModule = object

export class DynamicImportError extends CoolError {}

async function loadJavaScriptFile(pageId: PlaygroundPageId): Promise<JavaScriptModule> {
  try {
    return await import(`/code/client/${pageId}/index.js`)
  } catch (err) {
    throw new DynamicImportError(`Could not fetch JavaScript module for page ${repr(pageId)}.`, err)
  }
}

function loadCssFile(pageId: PlaygroundPageId): Promise<void> {
  const element = document.createElement('link')
  element.setAttribute('rel', 'stylesheet')
  element.setAttribute('href', `/styles/${pageId}.css`)
  document.head.appendChild(element)

  return new Promise(function (resolve, reject) {
    function onLoad() {
      element.removeEventListener('load', onLoad)
      element.removeEventListener('error', onError)
      resolve()
    }

    function onError(event: ErrorEvent) {
      element.removeEventListener('load', onLoad)
      element.removeEventListener('error', onError)
      reject(new DynamicImportError(`Could not fetch CSS module for page ${repr(pageId)}.`, event.error))
    }

    element.addEventListener('load', onLoad)
    element.addEventListener('error', onError)
  })
}

export async function loadPlaygroundPage(pageId: PlaygroundPageId) {
  const [m] = await Promise.all([loadJavaScriptFile(pageId), loadCssFile(pageId)])

  if ('indexPage' in m && m.indexPage instanceof Function) {
    return m.indexPage as WebsitePage
  }

  throw new DynamicImportError(`${repr(pageId)} does not export a component`)
}
