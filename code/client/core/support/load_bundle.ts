/* eslint-env browser */

import { repr } from '../../../common/support/strings.js'
import { CoolError } from '../../../common/errors.js'
import { FactoryComponentType } from '../../../common/rendering/component.js'
import { RouterState } from '../../../common/support/router_state.js'
import { PlaygroundPage } from '../../../common/types/playground_page.js'

window._dynamicImports = new Map()

export class DynamicImportError extends CoolError {}

export function loadCSSFile(filePath: string): Promise<void> {
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

    function onError(event: ErrorEvent) {
      element.removeEventListener('error', onError)
      reject(event.error)
    }

    element.addEventListener('load', onLoad)
    element.addEventListener('error', onError)
  })
}

function bufferToDataURL(buffer: BlobPart, mimeType: string): Promise<string> {
  const blob = new window.Blob([buffer], { type: mimeType })
  const reader = new window.FileReader()

  return new Promise(function(resolve, reject) {
    reader.onload = function() {
      resolve(reader.result as string)
    }

    reader.onerror = function(event: ProgressEvent<FileReader>) {
      reject(event.target!.error)
    }

    reader.readAsDataURL(blob)
  })
}

export function dynamicImport(url: string) {
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

interface Module {
  index: FactoryComponentType<RouterState>
}

export async function loadBundle(bundleName: PlaygroundPage) {
  const [m] = await Promise.all([
    dynamicImport(`${window.location.origin}/code/client/${bundleName}/index.js`),
    loadCSSFile(`/styles/${bundleName}/index.css`)
  ])

  if (!m || (m instanceof Object && !((m as Module).index instanceof Function))) {
    throw new DynamicImportError(`${repr(bundleName)} does not export a component`)
  }

  return (m as Module).index
}

export function isBrowserCompatibleWithBundle(bundleName: PlaygroundPage) {
  return window.PLAYGROUND_COMPATIBILITY[bundleName]
}
