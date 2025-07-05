import { type Observable, Subject, Subscription, filter, first, subscribeAsync } from '../observable.ts'
import { Component, FactoryComponent, type IComponentState, XmlComponent } from './component.ts'
import { RenderError } from './errors.ts'
import { FactoryRenderer, type IRendererContext, type Renderer, XmlRenderer } from './renderer.ts'
import { type INodeManipulator } from './types.ts'
import { type Logger } from '../logger.ts'
import { repr } from '../support/strings.ts'
import { type IFinalizeable } from '../types/finalizable.ts'
import { type IComponentEnvironment } from './component/component.ts'
import { firstOfIterable } from '../support/iteration.ts'

export interface IRenderEvent {
  component: Component
  status: 'success' | 'failure'
  error?: unknown
}

export class RenderingManager<NodeT> implements IFinalizeable {
  readonly logger: Logger
  readonly manipulator: INodeManipulator<NodeT>
  readonly env: IComponentEnvironment

  #componentRendererMap = new Map<Component, Renderer<NodeT>>()
  #stateSubscriptionMap = new Map<Component, Subscription<unknown>>()
  #currentlyRendering = new Set<Component>()
  #managedComponents = new Set<Component>()
  #managedRendererDependencies = new Map<Renderer, Set<Renderer>>()

  // We do not need to store subscriptions for renderNotify$ since the underlying subject gets destroyed along with the renderer
  renderNotify$ = new Subject<IRenderEvent>()

  constructor(logger: Logger, manipulator: INodeManipulator<NodeT>, env: IComponentEnvironment) {
    this.logger = logger
    this.manipulator = manipulator
    this.env = env
  }

  markComponentAsManaged(component: Component) {
    this.#managedComponents.add(component)

    for (const child of component.iterChildren()) {
      this.markComponentAsManaged(child)
    }
  }

  setManagingRenderer(renderer: Renderer, managingRenderer: Renderer) {
    if (this.#managedRendererDependencies.has(managingRenderer)) {
      this.#managedRendererDependencies.get(managingRenderer)!.add(renderer)
    } else {
      this.#managedRendererDependencies.set(managingRenderer, new Set([renderer]))
    }
  }

  async getRenderer(component: Component) {
    await this.#awaitPendingComponentRerender(component)
    const renderer = this.#componentRendererMap.get(component)

    if (renderer === undefined) {
      throw new RenderError('Component has no renderer associated', { component: repr(component) })
    }

    if (!this.#stateSubscriptionMap.has(component)) {
      this.logger.error('Component renderer has been finalized but is requested again; this can happen when an error occurs during state transition and the parent triggers a rerender.', { component: repr(component) })
    }

    return renderer
  }

  isComponentRendered(component: Component) {
    return this.#componentRendererMap.has(component)
  }

  isRendererFinalized(component: Component) {
    return this.#componentRendererMap.has(component) && !this.#stateSubscriptionMap.has(component)
  }

  #getRendererClass(component: Component): typeof Renderer<NodeT> {
    if (component instanceof XmlComponent) {
      return XmlRenderer
    }

    if (component instanceof FactoryComponent) {
      return FactoryRenderer
    }

    throw new RenderError('Don\'t know how to render component', { component: repr(component) })
  }

  // This method required substantial effort to get correct.
  // 1. The variable accum starts as null.
  // 2. We subscribe to the component state. It is important that the subscriber is async.
  // 3. We receive a renderer and its initial context from the initialize method.
  // 4. We assign the renderer and context to the accum variable and result the promise.
  // 5. Once we receive a subsequent component state, we use the last context to rerender and obtain a new context.
  #initializeRenderer<ComponentT extends Component = Component>(component: ComponentT): Promise<Renderer<NodeT>> {
    const rendererClass = this.#getRendererClass(component)
    let accum: { renderer: Renderer<NodeT>, context: IRendererContext } | null = null

    return new Promise((resolve, reject) => {
      const subscription = subscribeAsync(component.state$, {
        next: async (state: IComponentState) => {
          if (accum === null) {
            this.#currentlyRendering.add(component)

            try {
              accum = await rendererClass.initialize(this, component, state, this.env)
            } catch (err) {
              this.renderNotify$.next({ component, status: 'failure', error: err })
              reject(err)
              subscription.unsubscribe()
              this.#stateSubscriptionMap.delete(component)
              this.#currentlyRendering.delete(component)
              return
            }

            this.#currentlyRendering.delete(component)
            this.renderNotify$.next({ component, status: 'success' })
            resolve(accum.renderer)
          } else {
            await this.#awaitPendingComponentRerender(component)
            const { renderer, context } = accum
            this.#currentlyRendering.add(component)

            try {
              accum.context = await renderer.rerender(context, state)
            } catch (err) {
              this.renderNotify$.next({ component, status: 'failure', error: err })
              this.#currentlyRendering.delete(component)
              // We can also destroy the renderer here, however that would prevent us from possible recovery.
              return
            }

            this.#currentlyRendering.delete(component)
            this.renderNotify$.next({ component, status: 'success' })
          }
        },

        error: (err: unknown) => {
          if (accum) {
            this.renderNotify$.next({ component: accum.renderer.component, status: 'failure', error: err })

            this.finalizeRenderer(accum.renderer).catch((nestedErr: unknown) => {
              this.logger.error('Error while finalizing renderer', nestedErr)
            })
          }

          reject(err)
        },

        complete: () => {
          if (accum) {
            this.finalizeRenderer(accum.renderer).catch((nestedErr: unknown) => {
              this.logger.error('Error while finalizing renderer', nestedErr)
            })
          }
        },
      })

      this.#stateSubscriptionMap.set(component, subscription)
    })
  }

  async render(component: Component, managingRenderer?: Renderer): Promise<NodeT> {
    if (this.#currentlyRendering.has(component)) {
      throw new RenderError('Component is currently rendering', { component: repr(component) })
    }

    if (this.#componentRendererMap.has(component)) {
      throw new RenderError('Component has already been rendered', { component: repr(component) })
    }

    const renderer = await this.#initializeRenderer(component)

    if (managingRenderer) {
      this.setManagingRenderer(renderer, managingRenderer)
    }

    this.#componentRendererMap.set(component, renderer)
    return renderer.node
  }

  async #awaitPendingComponentRerender(component: Component): Promise<void> {
    while (this.#currentlyRendering.has(component)) {
      await this.awaitRendering(component)
    }
  }

  async awaitRendering(targetComponent?: Component): Promise<void> {
    let observable$: Observable<IRenderEvent> = this.renderNotify$

    if (targetComponent) {
      observable$ = observable$.pipe(
        filter(({ component }) => component === targetComponent),
      )
    }

    const event = await first(observable$)

    switch (event.status) {
      case 'failure':
        throw event.error
      case 'success':
        return
    }
  }

  async awaitPendingRerenders(): Promise<void> {
    while (this.#currentlyRendering.size > 0) {
      const component = firstOfIterable(this.#currentlyRendering)
      await this.awaitRendering(component)
    }
  }

  async finalizeRenderer(renderer: Renderer) {
    const component = renderer.component
    await this.#awaitPendingComponentRerender(component)

    if (this.#managedComponents.has(component)) {
      this.#managedComponents.delete(component)
      await component.finalize()
    }

    const stateSubscription = this.#stateSubscriptionMap.get(component)

    if (stateSubscription) {
      stateSubscription.unsubscribe()
      this.#stateSubscriptionMap.delete(component)
    }

    const dependencies = this.#managedRendererDependencies.get(renderer)

    if (dependencies) {
      for (const dependency of dependencies) {
        await this.finalizeRenderer(dependency)
      }
    }

    // We do not delete components from the renderer map so that we are able to detect when they have been erronously finalized.
    // This can happen if the component's state source errors out, in which case the renderer gets finalized,
    // but a re-render may still get triggered by a parent renderer.
    // this.#componentRendererMap.delete(component)
  }

  async finalize() {
    await this.awaitPendingRerenders()

    while (this.#componentRendererMap.size > 0) {
      const renderer = firstOfIterable(this.#componentRendererMap.values())
      await this.finalizeRenderer(renderer)
      this.#componentRendererMap.delete(renderer.component)
      await this.awaitPendingRerenders()
    }

    if (this.#managedComponents.size > 0) {
      this.logger.warn(`Manager was finalized, but there are still ${this.#managedComponents.size} managed components.`)
    }

    this.renderNotify$.complete()
  }
}
