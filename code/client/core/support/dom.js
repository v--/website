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

export function loadCSSFile (filePath) {
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

  return new Promise(function (resolve, reject) {
    function onLoad () {
      element.removeEventListener('load', onLoad)
      resolve()
    }

    function onError (err) {
      element.removeEventListener('error', onError)
      reject(err)
    }

    element.addEventListener('load', onLoad)
    element.addEventListener('error', onError)
  })
}
