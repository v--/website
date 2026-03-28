export interface INodeManipulator<NodeT = unknown> {
  createNode(type: string, namespace?: string): Promise<NodeT>
  destroyNode(node: NodeT): Promise<void>
  setAttribute<T>(node: NodeT, key: string, value: T): Promise<void>
  removeAttribute(node: NodeT, key: string): Promise<void>
  appendChild(node: NodeT, child: NodeT): Promise<void>
  replaceChild(node: NodeT, oldChild: NodeT, newChild: NodeT): Promise<void>
  removeChild(node: NodeT, child: NodeT): Promise<void>
  replaceSelf(oldNode: NodeT, newNode: NodeT): Promise<void>
}
