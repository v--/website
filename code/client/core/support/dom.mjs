/* eslint-env browser */

export function onDocumentReady () {
  if (!window.COMPATIBLE_INTERPRETER) {
    return new Promise(function () {})
  }

  if (document.readyState === 'interactive') {
    return Promise.resolve()
  }

  return new Promise(function (resolve) {
    function listener () {
      window.removeEventListener('DOMContentLoaded', listener)
      resolve()
    }

    window.addEventListener('DOMContentLoaded', listener)
  })
}
