import { ForbiddenError, NotFoundError } from '../../../common/errors.js'

export function onDocumentReady(): Promise<void> {
  return new Promise(function(resolve) {
    window.requestAnimationFrame(function() {
      if (!window.CORE_COMPATIBILITY) {
        return
      }

      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        return resolve()
      }

      function listener() {
        window.removeEventListener('DOMContentLoaded', listener)
        resolve()
      }

      window.addEventListener('DOMContentLoaded', listener)
    })
  })
}

export function getCurrentURL(): string {
  return document.location.href.slice(document.location.origin.length)
}

export function navigateTo(url: string): void {
  window.history.pushState(null, window.document.title, url)
}

export function showMessage(message: string) {
  window.alert(message)
}

export function createElement(type: string, namespace?: string): Element {
  if (namespace === undefined) {
    return document.createElement(type)
  }

  return document.createElementNS(namespace, type)
}

export async function fetchJSON(url: string): Promise<unknown> {
  const response = await window.fetch(url)

  switch (response.status) {
    case 403:
      throw new ForbiddenError()

    case 404:
      throw new NotFoundError()

    default:
      return response.json()
  }
}
