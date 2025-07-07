import { Component, type IComponentEnvironment, type IComponentStateSource } from './component.ts'
import { InvalidComponentError } from './errors.ts'
import { FactoryComponent, type FactoryComponentType, type IFactoryComponentState } from './factory.ts'
import { HtmlComponent, type HtmlComponentType, type IHtmlComponentState } from './html.ts'
import { MathMLComponent } from './mathml.ts'
import { type ISvgComponentState, SvgComponent, type SvgComponentType } from './svg.ts'
import { type ExtendedNullable } from '../../types/typecons.ts'

export class ComponentCreationHelper {
  * #filterChildren(children: Array<ExtendedNullable<Component>>): Generator<Component> {
    for (const child of children) {
      if (child instanceof Component) {
        yield child
      } else if (child) {
        throw new InvalidComponentError('Expected either a component or falsy value as a child', { child })
      }
    }
  }

  factory<
    StateT extends NonNullable<IFactoryComponentState>,
    EnvT extends IComponentEnvironment = IComponentEnvironment,
  >(
    type: FactoryComponentType<StateT, EnvT>,
    stateSource?: IComponentStateSource<StateT>,
    ...children: ExtendedNullable<Component>[]
  ): FactoryComponent<StateT, EnvT> {
    return new FactoryComponent(type, stateSource, this.#filterChildren(children))
  }

  html(
    type: HtmlComponentType,
    stateSource?: IComponentStateSource<IHtmlComponentState>,
    ...children: ExtendedNullable<Component>[]
  ): HtmlComponent {
    return new HtmlComponent(type, stateSource, this.#filterChildren(children))
  }

  svg(
    type: SvgComponentType,
    stateSource?: IComponentStateSource<ISvgComponentState>,
    ...children: ExtendedNullable<Component>[]
  ): SvgComponent {
    return new SvgComponent(type, stateSource, this.#filterChildren(children))
  }

  mathml(
    type: SvgComponentType,
    stateSource?: IComponentStateSource<ISvgComponentState>,
    ...children: ExtendedNullable<Component>[]
  ): MathMLComponent {
    return new MathMLComponent(type, stateSource, this.#filterChildren(children))
  }
}

export const createComponent = new ComponentCreationHelper()
