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

export function getWindowSize () {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isDesktop: window.innerWidth >= window.DESKTOP_WIDTH
  }
}

export function createResizeSubject () {
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
