import { Component, type IComponentEnvironment, type IComponentState } from './component.ts'
import { InvalidComponentError } from './errors.ts'
import { repr } from '../../support/strings.ts'
import { type uint32 } from '../../types/numbers.ts'

export type IFactoryComponentState = NonNullable<IComponentState>

export interface FactoryComponentType<
  StateT extends IFactoryComponentState = IFactoryComponentState,
  EnvT extends IComponentEnvironment = IComponentEnvironment,
> {
  (state: StateT, env: EnvT, children: Readonly<Component[]>): Component | Promise<Component>
}

export class FactoryComponent<
  StateT extends IFactoryComponentState = IFactoryComponentState,
  EnvT extends IComponentEnvironment = IComponentEnvironment,
> extends Component<FactoryComponentType<StateT, EnvT>> {
  async evaluate(state: StateT, env: EnvT): Promise<Component> {
    const component = await this.type(state, env, this.getChildren())

    if (!(component instanceof Component)) {
      throw new InvalidComponentError('Expected factory to return a component', { factory: this, result: repr(component) })
    }

    return component
  }

  override toString(indentation?: uint32) {
    return super.toString(indentation, 'c.factory')
  }
}
