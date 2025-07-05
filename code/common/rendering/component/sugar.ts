import { Component, type IComponentEnvironment, type IComponentState, type IComponentStateSource } from './component.ts'
import { InvalidComponentError } from './errors.ts'
import { FactoryComponent, type FactoryComponentType, type IFactoryComponentState } from './factory.ts'
import { HtmlComponent, type HtmlComponentType, type IHtmlComponentState } from './html.ts'
import { repr } from '../../support/strings.ts'
import { type ExtendedNullable } from '../../types/typecons.ts'

export function* filterChildren(children: Array<ExtendedNullable<Component>>): Generator<Component> {
  for (const child of children) {
    if (child instanceof Component) {
      yield child
    } else if (child) {
      throw new InvalidComponentError(`Expected either a component or falsy value as a child, but got ${repr(child)}`)
    }
  }
}

export function c<
  StateT extends NonNullable<IFactoryComponentState>,
  EnvT extends IComponentEnvironment = IComponentEnvironment,
>(
  type: FactoryComponentType<StateT, EnvT>,
  stateSource?: IComponentStateSource<StateT>,
  ...children: ExtendedNullable<Component>[]
): FactoryComponent<StateT>
export function c(
  type: HtmlComponentType,
  stateSource?: IComponentStateSource<IHtmlComponentState>,
  ...children: ExtendedNullable<Component>[]
): HtmlComponent
export function c(
  type: HtmlComponentType | FactoryComponentType,
  stateSource: IComponentStateSource<IComponentState> = undefined,
  ...children: ExtendedNullable<Component>[]
): HtmlComponent | FactoryComponent<NonNullable<IFactoryComponentState>> {
  switch (typeof type) {
    case 'string':
      return new HtmlComponent(type, stateSource, filterChildren(children))

    case 'function':
      return new FactoryComponent(type, stateSource, filterChildren(children))
  }
}
