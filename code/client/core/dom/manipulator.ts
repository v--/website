import { MissingElementError } from './errors.ts'
import { fromEvent } from './observable.ts'
import { IntegrityError } from '../../../common/errors.ts'
import { type Subscription, subscribeAsync } from '../../../common/observable.ts'
import { type HtmlComponent } from '../../../common/rendering/component.ts'
import { type INodeManipulator } from '../../../common/rendering/types.ts'
import { type IFinalizeable } from '../../../common/types/finalizable.ts'
import { type ClientLogger } from '../logger.ts'

export class DomManipulator implements INodeManipulator<Element, HtmlComponent>, IFinalizeable {
  logger: ClientLogger
  #subscriptionMap = new Map<Element, Map<string, Subscription<unknown>>>()

  constructor(logger: ClientLogger) {
    this.logger = logger
  }

  async createNode(component: HtmlComponent) {
    return component.namespace === undefined ?
        document.createElement(component.type) :
        document.createElementNS(component.namespace, component.type)
  }

  async destroyNode(node: Element) {
    const nodeSubscriptions = this.#subscriptionMap.get(node)

    if (nodeSubscriptions) {
      for (const sub of nodeSubscriptions.values()) {
        sub.unsubscribe()
      }
    }

    for (const child of Array.from(node.children)) {
      await this.destroyNode(child)
    }
  }

  async setAttribute<T>(node: Element, key: string, value: T) {
    const nodeSubscriptions = this.#subscriptionMap.get(node)
    nodeSubscriptions?.get(key)?.unsubscribe()

    if (key === 'text') {
      // That the text is a string has been verified in the component itself
      // If the component has children and later replaces them with text, this incidentally takes care of removing children.
      // This should not happen, however, because children are synchronized before the state by the factory renderer.
      node.textContent = value as string
    // Checkboxes and radio buttons require special care because their checked attribute only acts as a default to their checked property
    } else if (key === 'checked' && node instanceof HTMLInputElement) {
      node.checked = Boolean(value)
    // Indeterminate states for checkboxes and radio buttons aren't even supported as attributes
    } else if (key === 'intermediate' && node instanceof HTMLInputElement) {
      node.indeterminate = Boolean(value)
    // Other inputs are no less special
    } else if (key === 'value' && node instanceof HTMLInputElement) {
      node.value = String(value)
    } else if (value === true) {
      node.setAttribute(key, '')
    } else if (value === false) {
      node.removeAttribute(key)
    } else if (typeof value === 'string') {
      node.setAttribute(key, value)
    } else if (typeof value === 'number') {
      node.setAttribute(key, String(value))
    } else if (value instanceof Function) {
      const subscription = subscribeAsync(
        fromEvent(node, key),
        {
          next: async (event: Event) => {
            try {
              await value(event)
            } catch (err) {
              this.logger.error('Error while handling DOM event', err, { eventName: key, node })
            }
          },
        },
      )

      if (nodeSubscriptions) {
        nodeSubscriptions.set(key, subscription)
      } else {
        this.#subscriptionMap.set(node, new Map([[key, subscription]]))
      }
    } else if (value === undefined) {
      return
    } else {
      throw new IntegrityError('Unrecognized HTML component attribute', { key, value })
    }
  }

  async removeAttribute(node: Element, key: string) {
    if (key === 'text') {
      // This detail is important
      // If we have a component with text and we later remove the text and add children, the children will be synchronized before the state.
      // We must be careful when removing the text after that.
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          node.removeChild(child)
        }
      })
    } else if (key === 'checked' && node instanceof HTMLInputElement) {
      node.checked = false
    // Indeterminate states for checkboxes and radio buttons aren't even supported as attributes
    } else if (key === 'intermediate' && node instanceof HTMLInputElement) {
      node.indeterminate = false
    } else if (key === 'value' && node instanceof HTMLInputElement) {
      node.value = ''
    } else {
      const nodeSubscriptions = this.#subscriptionMap.get(node)
      nodeSubscriptions?.get(key)?.unsubscribe()
      node.removeAttribute(key)
    }
  }

  async appendChild(node: Element, child: Element) {
    node.appendChild(child)
  }

  async replaceChild(node: Element, oldChild: Element, newChild: Element) {
    node.replaceChild(newChild, oldChild)
  }

  async removeChild(node: Element, child: Element) {
    // There are some cases, not known to me, where we try to remove a non-existing child.
    if (child.parentNode === node) {
      node.removeChild(child)
    } else {
      this.logger.warn('Trying to remove a non-existing child.', { node, child })
    }
  }

  async replaceSelf(oldNode: Element, newNode: Element) {
    const parent = oldNode.parentElement

    if (parent === null) {
      throw new MissingElementError('Node has no parent element and thus cannot be replaced.', { node: oldNode })
    }

    parent.replaceChild(newNode, oldNode)
  }

  async finalize(): Promise<void> {
    for (const node of this.#subscriptionMap.keys()) {
      await this.destroyNode(node)
    }
  }
}
