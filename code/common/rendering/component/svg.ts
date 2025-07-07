import { Component } from './component.ts'
import { type IXmlComponentState, XmlComponent } from './xml.ts'
import { type Observable } from '../../observable.ts'
import { type uint32 } from '../../types/numbers.ts'

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
    return super.toString(indentation, 'c.svg')
  }
}
