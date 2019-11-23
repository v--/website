import { Subject } from '../../../common/observables/subject.js'
import { BehaviorSubject } from '../../../common/observables/behavior_subject.js'

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

export function createWindowSizeObservable () {
  function getWindowSize () {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isDesktop: window.innerWidth >= window.DESKTOP_WIDTH
    }
  }

  const subject = new BehaviorSubject(getWindowSize())

  function triggerUpdate () {
    subject.next(getWindowSize())
  }

  subject.subscribe({
    complete () {
      window.removeEventListener('resize', triggerUpdate)
    }
  })

  window.addEventListener('resize', triggerUpdate)
  return subject
}

export function createKeyDownSubject () {
  const subject = new Subject()

  function onKeyDown (event) {
    subject.next(event.key)
  }

  subject.subscribe({
    complete () {
      window.document.removeEventListener('keydown', onKeyDown)
    }
  })

  window.document.addEventListener('keydown', onKeyDown)
  return subject
}

export function createKeyUpSubject () {
  const subject = new Subject()

  function onKeyDown (event) {
    subject.next(event.key)
  }

  subject.subscribe({
    complete () {
      window.document.removeEventListener('keyup', onKeyDown)
    }
  })

  window.document.addEventListener('keyup', onKeyDown)
  return subject
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
