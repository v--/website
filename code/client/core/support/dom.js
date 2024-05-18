import { ForbiddenError, NotFoundError } from '../../../common/errors'

/**
 * @returns {Promise<void>}
 */
export function onDocumentReady() {
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

/**
 * @returns {string}
 */
export function getCurrentURL() {
  return document.location.href.slice(document.location.origin.length)
}

/**
 * @param {string} url
 */
export function navigateTo(url) {
  window.history.pushState(null, window.document.title, url)
}

/**
 * @param {string} message
 */
export function showMessage(message) {
  window.alert(message)
}

/**
 * @param {string} type
 * @param {string} [namespace]
 * @returns {Element}
 */
export function createElement(type, namespace) {
  if (namespace === undefined) {
    return document.createElement(type)
  }

  return document.createElementNS(namespace, type)
}

/**
 * @param {string} url
 * @returns {Promise<unknown>}
 */
export async function fetchJSON(url) {
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
