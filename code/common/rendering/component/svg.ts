import { Component } from './component.ts'
import { filterChildren } from './sugar.ts'
import { type IXmlComponentState, XmlComponent } from './xml.ts'
import { type Observable } from '../../observable.ts'
import { type uint32 } from '../../types/numbers.ts'
import { type ExtendedNullable } from '../../types/typecons.ts'

export type SvgComponentType = string
export type ISvgComponentState = IXmlComponentState

export class SvgComponent extends XmlComponent<SvgComponentType, ISvgComponentState> {
  constructor(
    type: SvgComponentType,
    stateSource: ISvgComponentState | Observable<ISvgComponentState>,
    children: Iterable<Component>,
  ) {
    super(type, stateSource, children, 'http://www.w3.org/2000/svg')
  }

  override toString(indentation?: uint32) {
    return super.toString(indentation, 's')
  }
}

/*
 * There was no good way to fit SVG components into the function c, so we made a new one
 */
export function s(
  type: SvgComponentType,
  stateSource?: ISvgComponentState | Observable<ISvgComponentState>
): SvgComponent
export function s(
  type: SvgComponentType,
  stateSource: ISvgComponentState | Observable<ISvgComponentState>,
  ...children: ExtendedNullable<Component>[]
): SvgComponent
export function s(
  type: SvgComponentType,
  stateSource: ISvgComponentState | Observable<ISvgComponentState> = {},
  ...children: Array<ExtendedNullable<Component>>
): SvgComponent {
  return new SvgComponent(type, stateSource, filterChildren(children))
}
