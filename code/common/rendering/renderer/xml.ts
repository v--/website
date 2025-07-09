import { getObjectEntries } from '../../support/iteration.ts'
import { type IComponentEnvironment, type IXmlComponentState, type XmlComponent } from '../component.ts'
import { type RenderingManager } from '../manager.ts'
import { type IRendererContext, Renderer } from './renderer.ts'

export interface IXmlRendererContext extends IRendererContext {
  lastComponentState: IXmlComponentState
}

export class XmlRenderer<NodeT = unknown> extends Renderer<NodeT> {
  declare component: XmlComponent

  static async initialize<NodeT = unknown>(
    manager: RenderingManager<NodeT>,
    component: XmlComponent,
    state: IXmlComponentState,
    env: IComponentEnvironment,
  ): Promise<{ renderer: XmlRenderer<NodeT>, context: IXmlRendererContext }> {
    const node = await manager.manipulator.createNode(component)
    const renderer = new this(manager, component, node, env)
    await renderer.performInitialRender(state)
    return { renderer, context: { lastComponentState: state } }
  }

  async performInitialRender(state: IXmlComponentState): Promise<IXmlRendererContext> {
    if (state) {
      for (const [key, value] of getObjectEntries(state)) {
        await this.manager.manipulator.setAttribute(this.node, key, value)
      }
    }

    for (const child of this.component.getChildren()) {
      const childRenderer = await this.manager.render(child, this)
      await this.manager.manipulator.appendChild(this.node, childRenderer)
    }

    return { lastComponentState: state }
  }

  async #updateAttributes(oldState: Record<string, unknown>, newState: Record<string, unknown>) {
    const oldKeys = new Set(Object.keys(oldState))
    const newKeys = new Set(Object.keys(newState))
    const keys = oldKeys.union(newKeys)

    for (const key of keys) {
      if (oldKeys.has(key) && newKeys.has(key)) {
        if (oldState[key] !== newState[key]) {
          await this.manager.manipulator.setAttribute(this.node, key, newState[key])
        }
      } else if (oldKeys.has(key)) {
        await this.manager.manipulator.removeAttribute(this.node, key)
      } else if (newKeys.has(key)) {
        await this.manager.manipulator.setAttribute(this.node, key, newState[key])
      }
    }
  }

  override async rerender(context: IXmlRendererContext, state: IXmlComponentState) {
    if (context.lastComponentState ?? state) {
      await this.#updateAttributes(
        (context.lastComponentState ?? {}) as Record<string, unknown>,
        (state ?? {}) as Record<string, unknown>,
      )
    }

    return { lastComponentState: state }
  }
}
