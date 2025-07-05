import { CoolError } from '../../common/errors.ts'
import { HtmlComponent } from '../../common/rendering/component.ts'
import { type INodeManipulator } from '../../common/rendering/types.ts'

export class MirrorDomError extends CoolError {}

export class MirrorDomManipulator implements INodeManipulator<HtmlComponent, HtmlComponent> {
  #childToParentMap = new Map<HtmlComponent, HtmlComponent>()

  async createNode(component: HtmlComponent) {
    const state = await component.getState()
    return new HtmlComponent(component.type, state, [])
  }

  async destroyNode(node: HtmlComponent) {
    this.#childToParentMap.delete(node)

    for (const [child, parent] of this.#childToParentMap.entries()) {
      if (node === parent) {
        await this.destroyNode(child)
      }
    }
  }

  async setAttribute(node: HtmlComponent, key: string, value: unknown) {
    const oldState = await node.getState()
    node.updateState({ ...oldState, [key]: value })
  }

  async removeAttribute(node: HtmlComponent, key: string) {
    const oldState = await node.getState()

    if (oldState) {
      const newState: Record<string, unknown> = { ...oldState }
      delete newState[key]
      node.updateState(newState)
    }
  }

  async appendChild(node: HtmlComponent, child: HtmlComponent) {
    node.appendChild(child)
    this.#childToParentMap.set(child, node)
  }

  async replaceChild(node: HtmlComponent, oldChild: HtmlComponent, newChild: HtmlComponent) {
    const index = Array.from(node.iterChildren()).indexOf(oldChild)
    this.#childToParentMap.delete(oldChild)
    this.#childToParentMap.set(newChild, node)
    node.setNthChild(index, newChild)
  }

  async removeChild(node: HtmlComponent, child: HtmlComponent) {
    const children = Array.from(node.iterChildren())
    this.#childToParentMap.delete(child)
    const index = children.indexOf(child)
    children.splice(index, 1)
    node.updateChildren(children)
  }

  async replaceSelf(oldNode: HtmlComponent, newNode: HtmlComponent) {
    const parent = this.#childToParentMap.get(oldNode)

    if (parent === undefined) {
      throw new MirrorDomError('Expected node to have a parent element set', { node: oldNode })
    }

    await this.replaceChild(parent, oldNode, newNode)
  }
}
