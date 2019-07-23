import Observable from '../../../common/observables/observable.js'

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

export function createResizeObservable () {
  return new Observable(function (observer) {
    function triggerUpdate () {
      observer.next({
        width: window.innerWidth,
        height: window.innerHeight,
        isDesktop: window.innerWidth >= window.DESKTOP_WIDTH
      })
    }

    window.addEventListener('resize', triggerUpdate)
    triggerUpdate()
    return window.removeEventListener.bind(window, 'resize', triggerUpdate)
  })
}
