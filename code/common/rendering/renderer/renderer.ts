import { NotImplementedError } from '../../errors.ts'
import { type IComponentEnvironment } from '../component/component.ts'
import { Component, type IComponentState } from '../component.ts'
import { type RenderingManager } from '../manager.ts'

export type IRendererContext = object

export abstract class Renderer<NodeT = unknown> {
  readonly manager: RenderingManager<NodeT>
  readonly component: Component
  readonly node: NodeT
  readonly env: IComponentEnvironment

  static initialize<NodeT = unknown>(
  /* eslint-disable @unused-imports/no-unused-vars */
    manager: RenderingManager<NodeT>,
    component: Component,
    state: IComponentState,
    env: IComponentEnvironment,
  /* eslint-enable @unused-imports/no-unused-vars */
  ): Promise<{ renderer: Renderer<NodeT>, context: IRendererContext }> {
    throw new NotImplementedError()
  }

  constructor(
    manager: RenderingManager<NodeT>,
    component: Component,
    node: NodeT,
    env: IComponentEnvironment,
  ) {
    this.manager = manager
    this.component = component
    this.node = node
    this.env = env
  }

  abstract rerender(context: IRendererContext, state: IComponentState): Promise<IRendererContext>
}
