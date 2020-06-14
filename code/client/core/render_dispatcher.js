import { XMLComponent, FactoryComponent } from '../../common/rendering/component.js'
import { XMLRenderer, FactoryRenderer, RenderDispatcher } from '../../common/rendering/renderer.js'

import { createElement } from './support/dom.js'

export class DOMXMLRenderer extends XMLRenderer {
  _createNode () {
    return createElement(this.component.type, this.component.namespace)
  }

  _setAttribute (key, value, oldValue) {
    if (value === true) {
      this.element.setAttribute(key, '')
    } else if (value === false) {
      this.element.removeAttribute(key)
    } else if (typeof value === 'string') {
      this.element.setAttribute(key, value)
    } else if (value instanceof Function) {
      this.element.removeEventListener(key, oldValue)
      this.element.addEventListener(key, value)
    }
  }

  _removeAttribute (key, oldValue) {
    if (oldValue instanceof Function) {
      this.element.removeEventListener(key, oldValue)
    } else {
      this.element.removeAttribute(key)
    }
  }

  _setText (value) {
    this.element.textContent = value
  }

  _removeText () {
    this.element.textContent = ''
  }

  _appendChild (child) {
    this.element.appendChild(child)
  }

  _replaceChild (oldChild, newChild) {
    this.element.replaceChild(newChild, oldChild)
  }

  _removeChild (child) {
    this.element.removeChild(child)
  }
}

export const dispatcher = RenderDispatcher.fromRenderers(new Map([
  [XMLComponent, DOMXMLRenderer],
  [FactoryComponent, FactoryRenderer]
]))
