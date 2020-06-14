/* eslint-env browser */

import { ForbiddenError, NotFoundError } from '../../../common/errors.js'

export function onDocumentReady () {
  return new Promise(function (resolve) {
    window.requestAnimationFrame(function () {
      if (!window.CORE_COMPATIBILITY) {
        return
      }

      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        return resolve()
      }

      function listener () {
        window.removeEventListener('DOMContentLoaded', listener)
        resolve()
      }

      window.addEventListener('DOMContentLoaded', listener)
    })
  })
}

export function getCurrentURL () {
  return document.location.href.slice(document.location.origin.length)
}

export function navigateTo (url) {
  window.history.pushState(null, null, url)
}

export function showMessage (message) {
  window.alert(message)
}

export function createElement (type, namespace = null) {
  if (namespace === null) {
    return document.createElement(type)
  }

  return document.createElementNS(namespace, type)
}

export async function fetchJSON (url) {
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
