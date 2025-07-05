import { Component } from './component.ts'
import { filterChildren } from './sugar.ts'
import { type IXmlComponentState, XmlComponent } from './xml.ts'
import { type Observable } from '../../observable.ts'
import { type uint32 } from '../../types/numbers.ts'
import { type ExtendedNullable } from '../../types/typecons.ts'

export type MathMLComponentType = string
export type IMathMLComponentState = IXmlComponentState

export class MathMLComponent extends XmlComponent<MathMLComponentType, IMathMLComponentState> {
  constructor(
    type: MathMLComponentType,
    stateSource: IMathMLComponentState | Observable<IMathMLComponentState>,
    children: Iterable<Component>,
  ) {
    super(type, stateSource, children, 'http://www.w3.org/1998/Math/MathML')
  }

  override toString(indentation?: uint32) {
    return super.toString(indentation, 'm')
  }
}

/*
 * There was no good way to fit SVG components into the function c, so we made a new one
 */
export function m(
  type: MathMLComponentType,
  stateSource?: IMathMLComponentState | Observable<IMathMLComponentState>
): MathMLComponent
export function m(
  type: MathMLComponentType,
  stateSource: IMathMLComponentState | Observable<IMathMLComponentState>,
  ...children: ExtendedNullable<Component>[]
): MathMLComponent
export function m(
  type: MathMLComponentType,
  stateSource: IMathMLComponentState | Observable<IMathMLComponentState> = {},
  ...children: Array<ExtendedNullable<Component>>
): MathMLComponent {
  return new MathMLComponent(type, stateSource, filterChildren(children))
}
