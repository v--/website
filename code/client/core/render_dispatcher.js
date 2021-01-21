import { XMLComponent } from '../../common/rendering/component.js'
import { RenderDispatcher } from '../../common/rendering/renderer.js'

import { createElement } from './support/dom.js'

/** @type {TRendering.INodeManipulator<Element>} */
export const domManipulator = {
  /**
   * @param {XMLComponent} component
   */
  createNode(component) {
    return createElement(component.type, component.namespace)
  },

  /**
   * @param {Element} node
   * @param {string} key
   * @param {unknown} value
   * @param {unknown} [oldValue]
   */
  setAttribute(node, key, value, oldValue) {
    if (value === true) {
      node.setAttribute(key, '')
    } else if (value === false) {
      node.removeAttribute(key)
    } else if (typeof value === 'string') {
      node.setAttribute(key, value)
    } else if (value instanceof Function) {
      node.removeEventListener(key, /** @type {TCons.Action<Event>} */ (oldValue))
      node.addEventListener(key, /** @type {TCons.Action<Event>} */ (value))
    }
  },

  /**
   * @param {Element} node
   * @param {string} key
   * @param {unknown} oldValue
   */
  removeAttribute(node, key, oldValue) {
    if (oldValue instanceof Function) {
      node.removeEventListener(key, /** @type {TCons.Action<Event>} */ (oldValue))
    } else {
      node.removeAttribute(key)
    }
  },

  /**
   * @param {Element} node
   * @param {string} value
   */
  setText(node, value) {
    node.textContent = value
  },

  /**
   * @param {Element} node
   */
  removeText(node) {
    node.textContent = ''
  },

  /**
   * @param {Element} node
   * @param {Element} child
   */
  appendChild(node, child) {
    node.appendChild(child)
  },

  /**
   * @param {Element} node
   * @param {Element} oldChild
   * @param {Element} newChild
   */
  replaceChild(node, oldChild, newChild) {
    node.replaceChild(newChild, oldChild)
  },

  /**
   * @param {Element} node
   * @param {Element} child
   */
  removeChild(node, child) {
    node.removeChild(child)
  }
}

export const dispatcher = RenderDispatcher.fromManipulator(domManipulator)
