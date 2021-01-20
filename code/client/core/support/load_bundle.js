import { repr } from '../../../common/support/strings.js'
import { CoolError } from '../../../common/errors.js'

/**
 * @typedef {object} PlaygroundModule
 * @property {TComponents.FactoryComponentType<TRouter.IRouterState>} index
 */

/**
 * @type {Map<string, PlaygroundModule>}
 */
window._dynamicImports = new Map()

export class DynamicImportError extends CoolError {}

/**
 * @param {string} filePath
 * @returns {Promise<void>}
 */
export function loadCSSFile(filePath) {
  const href = window.location.origin + filePath
  const links = document.head.getElementsByTagName('link')

  for (let i = 0; i < links.length; i++) {
    if (links[i].href === href) {
      return Promise.resolve()
    }
  }

  const element = document.createElement('link')
  element.rel = 'stylesheet'
  element.href = href
  document.head.appendChild(element)

  return new Promise(function(resolve, reject) {
    function onLoad() {
      element.removeEventListener('load', onLoad)
      resolve()
    }

    /**
     * @param {ErrorEvent} event
     */
    function onError(event) {
      element.removeEventListener('error', onError)
      reject(event.error)
    }

    element.addEventListener('load', onLoad)
    element.addEventListener('error', onError)
  })
}

/**
 * @param {BlobPart} buffer
 * @param {string} mimeType
 * @returns Promise<string>
 */
function bufferToDataURL(buffer, mimeType) {
  const blob = new window.Blob([buffer], { type: mimeType })
  const reader = new window.FileReader()

  return new Promise(function(resolve, reject) {
    reader.onload = function() {
      resolve(/** @type {string} */ reader.result)
    }

    reader.onerror = /** @param {ProgressEvent<FileReader>} event */ function(event) {
      if (event.target) {
        reject(event.target.error)
      }
    }

    reader.readAsDataURL(blob)
  })
}

/**
 * @param {string} url
 */
export function dynamicImport(url) {
  return new Promise(function(resolve, reject) {
    const element = document.createElement('script')
    const quotedURL = JSON.stringify(url)

    element.type = 'module'

    element.onload = function(_event) {
      resolve(window._dynamicImports.get(url))
    }

    element.onerror = function(_event) {
      reject(new DynamicImportError(`Could not load ${quotedURL}`))
    }

    bufferToDataURL(`import * as m from ${quotedURL}; window._dynamicImports.set(${quotedURL}, m)`, 'text/javascript').then(function(encoded) {
      element.src = encoded
      document.head.appendChild(element)
    })
  })
}

/**
 * @param {TPlayground.PlaygroundPage} bundleName
 */
export async function loadBundle(bundleName) {
  const [m] = await Promise.all([
    dynamicImport(`${window.location.origin}/code/client/${bundleName}/index.js`),
    loadCSSFile(`/styles/${bundleName}/index.css`)
  ])

  if (!m || (m instanceof Object && !((/** @type {PlaygroundModule} */ (m)).index instanceof Function))) {
    throw new DynamicImportError(`${repr(bundleName)} does not export a component`)
  }

  return (/** @type {PlaygroundModule} */ (m)).index
}

/**
 * @param {TPlayground.PlaygroundPage} bundleName
 */
export function isBrowserCompatibleWithBundle(bundleName) {
  return window.PLAYGROUND_COMPATIBILITY[bundleName]
}
