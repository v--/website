import { Component, type IComponentEnvironment, type IComponentState } from './component.ts'
import { InvalidComponentError } from './errors.ts'
import { repr } from '../../support/strings.ts'

export type IFactoryComponentState = NonNullable<IComponentState>

export interface FactoryComponentType<
  StateT extends IFactoryComponentState = IFactoryComponentState,
  EnvT extends IComponentEnvironment = IComponentEnvironment,
> {
  (state: StateT, env: EnvT, children: Component[]): Component | Promise<Component>
}

export class FactoryComponent<StateT extends IFactoryComponentState = IFactoryComponentState> extends Component<FactoryComponentType<StateT>> {
  async evaluate(state: StateT, env: IComponentEnvironment): Promise<Component> {
    const component = await this.type(state, env, Array.from(this.iterChildren()))

    if (!(component instanceof Component)) {
      throw new InvalidComponentError('Expected factory to return a component', { factory: this, result: repr(component) })
    }

    return component
  }
}
