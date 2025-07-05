import { type XmlComponent } from './component.ts'

export interface INodeManipulator<NodeT = unknown, ComponentT extends XmlComponent = XmlComponent> {
  createNode(component: ComponentT): Promise<NodeT>
  destroyNode(node: NodeT): Promise<void>
  setAttribute<T>(node: NodeT, key: string, value: T): Promise<void>
  removeAttribute(node: NodeT, key: string): Promise<void>
  appendChild(node: NodeT, child: NodeT): Promise<void>
  replaceChild(node: NodeT, oldChild: NodeT, newChild: NodeT): Promise<void>
  removeChild(node: NodeT, child: NodeT): Promise<void>
  replaceSelf(oldNode: NodeT, newNode: NodeT): Promise<void>
}
