import { XMLComponent } from '../../common/rendering/component.js'
import { RenderDispatcher, INodeManipulator } from '../../common/rendering/renderer.js'

import { createElement } from './support/dom.js'

export const domManipulator: INodeManipulator<Element> = {
  createNode(component: XMLComponent) {
    return createElement(component.type, component.namespace)
  },

  setAttribute<T extends unknown>(node: Element, key: string, value: T, oldValue?: T) {
    if (value === true) {
      node.setAttribute(key, '')
    } else if (value === false) {
      node.removeAttribute(key)
    } else if (typeof value === 'string') {
      node.setAttribute(key, value)
    } else if (value instanceof Function) {
      node.removeEventListener(key, oldValue as Action<Event>)
      node.addEventListener(key, value as Action<Event>)
    }
  },

  removeAttribute<T extends unknown>(node: Element, key: string, oldValue: T) {
    if (oldValue instanceof Function) {
      node.removeEventListener(key, oldValue as Action<Event>)
    } else {
      node.removeAttribute(key)
    }
  },

  setText(node: Element, value: string) {
    node.textContent = value
  },

  removeText(node: Element) {
    node.textContent = ''
  },

  appendChild(node: Element, child: Element) {
    node.appendChild(child)
  },

  replaceChild(node: Element, oldChild: Element, newChild: Element) {
    node.replaceChild(newChild, oldChild)
  },

  removeChild(node: Element, child: Element) {
    node.removeChild(child)
  }
}

export const dispatcher = RenderDispatcher.fromRenderers(domManipulator)
