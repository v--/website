import { c } from '../../../common/component'
import { onDocumentReady } from '../../core/support/dom'

const resizeListenerMap = new WeakMap()

window.render.observables.create.subscribe({
  next (node) {
    if (node.component.type !== aspectRatioBox) {
      return
    }

    function onResize () {
      const ratio = node.component.state.current.ratio
      const body = node.element.firstChild

      let width = node.element.offsetWidth
      let height = node.element.offsetHeight

      if (width / height <= ratio) {
        height = Math.round(width / ratio)
      } else {
        width = Math.round(height * ratio)
      }

      body.style.width = width + 'px'
      body.style.height = height + 'px'
    }

    resizeListenerMap.set(node.element, onResize)
    window.addEventListener('resize', onResize)
    onDocumentReady().then(onResize)
  }
})

window.render.observables.destroy.subscribe({
  next (node) {
    if (node.component.type !== aspectRatioBox) {
      return
    }

    window.removeEventListener('resize', resizeListenerMap.get(node.element))
    resizeListenerMap.delete(node.element)
  }
})

export default function aspectRatioBox ({ ratio, item }) {
  return c('div', { class: 'aspect-ratio-box' },
    c('div', { class: 'aspect-ratio-box-body' }, item)
  )
}
