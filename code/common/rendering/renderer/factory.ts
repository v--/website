import { type IRendererContext, Renderer } from './renderer.ts'
import { XmlRenderer } from './xml.ts'
import { type uint32 } from '../../types/numbers.ts'
import { Component, ComponentSanityError, FactoryComponent, type IComponentEnvironment, type IFactoryComponentState } from '../component.ts'
import { type RenderingManager } from '../manager.ts'

export interface IFactoryRendererContext extends IRendererContext {
  lastRoot: Component
}

interface GarbageTruck {
  /*
   * We keep a queue of renderers for later destruction. A renderer that was already marked for deletion
   * may be visited again at a later stage. In that case we ignore it, unless it is the root renderer
   * of a component that has itself triggered the rerender. We do not want to ignore renderers
   * that have been destroyed in parallel elsewhere, because that would be a bug.
   * So rather than ignoring all renderers that could not be found, we ignore those that have been marked.
   *
   * For example, during transclusion, when processing the factory component, it children will be synchronized,
   * and then those same children will get synchronized again after getting transcluded.
   *
   * This can be quite subtle; it is covered in both unit and e2e tests.
   */
  renderers: Set<Renderer>
}

export class FactoryRenderer<NodeT = unknown> extends Renderer<NodeT> {
  declare component: FactoryComponent

  static async initialize<NodeT = unknown>(
    manager: RenderingManager<NodeT>,
    component: FactoryComponent,
    state: IFactoryComponentState,
    env: IComponentEnvironment,
  ): Promise<{ renderer: FactoryRenderer<NodeT>, context: IFactoryRendererContext }> {
    const root = await component.evaluate(state, env)
    const node = await manager.render(root)
    // It is important that we mark the root as managed after the render call because the render call may fail.
    // If it fails, the root would be left managed without a renderer.
    manager.markComponentAsManaged(root)
    const renderer = new FactoryRenderer(manager, component, node, env)
    const rootRenderer = await manager.getRenderer(root)
    manager.setManagingRenderer(rootRenderer, renderer)
    return { renderer, context: { lastRoot: root } }
  }

  async #updateChild(
    gcTruck: GarbageTruck,
    updatedChildren: Component[],
    rootRenderer: Renderer<NodeT>,
    oldRoot: Component,
    newRoot: Component,
    i: uint32,
  ) {
    const oldChild = oldRoot.getChildren()[i]
    const newChild = newRoot.getChildren()[i]

    if (oldChild === newChild) {
      return
    }

    await this.#syncChildren(gcTruck, oldChild, newChild)
    oldChild.updateStateSource(newChild.getStateSource())
  }

  async #replaceChild(
    gcTruck: GarbageTruck,
    updatedChildren: Component[],
    rootRenderer: Renderer<NodeT>,
    oldRoot: Component,
    newRoot: Component,
    i: uint32,
  ) {
    const oldChild = oldRoot.getChildren()[i]
    const newChild = newRoot.getChildren()[i]
    const oldRenderer = await this.manager.getRenderer(oldChild)

    // This pair has already been processed; perhaps as part of a transclusion process.
    if (gcTruck.renderers.has(oldRenderer)) {
      return
    }

    if (rootRenderer instanceof XmlRenderer) {
      const newChildNode = await this.manager.render(newChild, rootRenderer)
      this.manager.markComponentAsManaged(newChild)

      await this.manager.manipulator.replaceChild(
        rootRenderer.node,
        oldRenderer.node,
        newChildNode,
      )

      await this.manager.manipulator.destroyNode(oldRenderer.node)
    }

    updatedChildren[i] = newChild
    gcTruck.renderers.add(oldRenderer)
  }

  async #appendChild(
    gcTruck: GarbageTruck,
    updatedChildren: Component[],
    rootRenderer: Renderer<NodeT>,
    oldRoot: Component,
    newChild: Component,
  ) {
    if (rootRenderer instanceof XmlRenderer) {
      const newChildNode = await this.manager.render(newChild, rootRenderer)
      this.manager.markComponentAsManaged(newChild)

      await this.manager.manipulator.appendChild(
        rootRenderer.node,
        newChildNode,
      )
    }

    updatedChildren.push(newChild)
  }

  async #popChild(
    gcTruck: GarbageTruck,
    updatedChildren: Component[],
    rootRenderer: Renderer<NodeT>,
  ) {
    const oldChild = updatedChildren.pop()

    if (oldChild === undefined) {
      throw new ComponentSanityError('Attempting to pop empty child list.')
    }

    const oldRenderer = await this.manager.getRenderer(oldChild)

    // This pair has already been processed; perhaps as part of a transclusion process.
    if (gcTruck.renderers.has(oldRenderer)) {
      return
    }

    if (rootRenderer instanceof XmlRenderer) {
      await this.manager.manipulator.removeChild(
        rootRenderer.node,
        oldRenderer.node,
      )

      await this.manager.manipulator.destroyNode(oldRenderer.node)
    }

    gcTruck.renderers.add(oldRenderer)
  }

  async #syncChildren(gcTruck: GarbageTruck, oldRoot: Component, newRoot: Component) {
    const rootRenderer = await this.manager.getRenderer(oldRoot)
    const oldChildren = oldRoot.getChildren()
    const newChildren = newRoot.getChildren()
    const updatedChildren = Array.from(oldChildren)

    // The order of operations may be important here (e.g. we must not do appending before updating).
    for (let i = 0; i < Math.min(oldChildren.length, newChildren.length); i++) {
      const oldChild = oldChildren[i]
      const newChild = newChildren[i]

      if (oldChild.constructor === newChild.constructor && oldChild.type === newChild.type) {
        await this.#updateChild(gcTruck, updatedChildren, rootRenderer, oldRoot, newRoot, i)
      } else {
        await this.#replaceChild(gcTruck, updatedChildren, rootRenderer, oldRoot, newRoot, i)
      }
    }

    for (let i = oldChildren.length; i < newChildren.length; i++) {
      await this.#appendChild(gcTruck, updatedChildren, rootRenderer, oldRoot, newChildren[i])
    }

    for (let i = newChildren.length; i < oldChildren.length; i++) {
      await this.#popChild(gcTruck, updatedChildren, rootRenderer)
    }

    oldRoot.updateChildren(updatedChildren)
    await newRoot.finalize()
  }

  override async rerender(context: IFactoryRendererContext, state: IFactoryComponentState) {
    const oldRoot = context.lastRoot
    const newRoot = await this.component.evaluate(state, this.env)

    // This is the unusual scenario. In fact, the system did not support changing the type of the root element
    // for years. It is a sign of bad design as it causes a lot more re-rendering, however there turned out
    // to be a case which lead to such a situation indirectly - namely, if sibling multiple components
    // have the same factory and one of them goes missing; refer to the test labeled BF7.
    //
    // This will fail if the "root" component has no parent (i.e. if it a real root).
    if (newRoot.constructor !== oldRoot.constructor || newRoot.type !== oldRoot.type) {
      this.manager.logger.warn(
        'Factory component has produced an incompatible root element upon rerendering. This is a heavy DOM operation and should generally be avoided.',
        { oldRoot: String(oldRoot), newRoot: String(newRoot) },
      )

      const oldRenderer = await this.manager.getRenderer(oldRoot)
      await this.manager.finalizeRenderer(oldRenderer)

      await this.manager.render(newRoot)
      const newRenderer = await this.manager.getRenderer(newRoot)
      await this.manager.manipulator.replaceSelf(oldRenderer.node, newRenderer.node)
      await this.manager.manipulator.destroyNode(oldRenderer.node)

      return { lastRoot: newRoot }
    }

    // This is the usual scenario where the system tries to only rerender what is necessary.
    const gcTruck: GarbageTruck = { renderers: new Set<Renderer>() }

    await this.#syncChildren(gcTruck, oldRoot, newRoot)
    oldRoot.updateStateSource(newRoot.getStateSource())

    for (const oldRenderer of gcTruck.renderers) {
      await this.manager.finalizeRenderer(oldRenderer)
    }

    return { lastRoot: oldRoot }
  }
}
