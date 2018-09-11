import { Observable } from '../../../common/support/observable.mjs'

export function onDocumentReady () {
  return new Promise(function (resolve) {
    window.requestAnimationFrame(function () {
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

export class ResizeObservable extends Observable {
  constructor () {
    super({
      width: window.innerWidth,
      height: window.innerHeight,
      isDesktop: window.innerWidth >= window.DESKTOP_WIDTH
    })

    this._triggerUpdate = ResizeObservable.prototype.triggerUpdate.bind(this)
    window.addEventListener('resize', this._triggerUpdate)

    onDocumentReady().then(function () {
      window.requestAnimationFrame(function () {
        this.triggerUpdate()
      }.bind(this))
    }.bind(this))
  }

  complete () {
    window.removeEventListener('resize', this._triggerUpdate)
  }

  triggerUpdate () {
    this.emit({
      width: window.innerWidth,
      height: window.innerHeight,
      isDesktop: window.innerWidth >= window.DESKTOP_WIDTH
    })
  }
}
