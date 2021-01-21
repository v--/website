declare namespace TRendering {
  interface IRenderEvent<NodeType> {
    component: TComponents.IComponent
    element?: NodeType
  }

  interface IRenderer<NodeType> {
    render(): NodeType
    rerender(): void
    destroy(): void
    component: TComponents.IComponent
    element?: NodeType
  }

  interface IRenderDispatcher<NodeType> {
    render(component: TComponents.IComponent): NodeType
    cache: TCons.NonStrictWeakMap<TComponents.IComponent, IRenderer<NodeType>>
    events: {
      create: TObservables.ISubject<IRenderEvent<NodeType>>,
      destroy: TObservables.ISubject<IRenderEvent<NodeType>>
    }
  }

  export interface RenderingFunction<ComponentType, NodeType> {
    (component: ComponentType, dispatcher: IRenderDispatcher<NodeType>): NodeType
  }

  export interface INodeManipulator<NodeType> {
    createNode(component: TComponents.IComponent): NodeType
    setAttribute<T>(node: NodeType, key: string, value: T, oldValue?: T): void
    removeAttribute<T>(node: NodeType, key: string, oldValue?: T): void
    setText(node: NodeType, value: string): void
    removeText(node: NodeType): void
    appendChild(node: NodeType, child: NodeType): void
    replaceChild(node: NodeType, oldChild: NodeType, newChild: NodeType): void
    removeChild(node: NodeType, child: NodeType): void
  }
}
