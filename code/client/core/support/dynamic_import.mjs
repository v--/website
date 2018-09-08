import { CoolError } from '../../../common/errors.mjs'

window._dynamicImports = new Map()

export class DynamicImportError extends CoolError {}

function bufferToDataURL (buffer, mimeType) {
  var blob = new window.Blob([buffer], { type: mimeType })
  var reader = new window.FileReader()

  return new Promise(function (resolve, reject) {
    reader.onload = function () {
      resolve(reader.result)
    }

    reader.onerror = function (event) {
      reject(event.target.error)
    }

    reader.readAsDataURL(blob)
  })
}

export default function dynamicImport (url) {
  return new Promise(function (resolve, reject) {
    const element = document.createElement('script')
    const quotedURL = JSON.stringify(url)

    element.type = 'module'

    element.onload = function (_event) {
      resolve(window._dynamicImports.get(url))
    }

    element.onerror = function (event) {
      reject(new DynamicImportError(`Could not load ${quotedURL}`))
    }

    bufferToDataURL(`import stuff from ${quotedURL}; window._dynamicImports.set(${quotedURL}, stuff)`, 'text/javascript').then(function (encoded) {
      element.src = encoded
      document.head.appendChild(element)
    })
  })
}
