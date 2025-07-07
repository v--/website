import { Component } from './component.ts'
import { type IXmlComponentState, XmlComponent } from './xml.ts'
import { type Observable } from '../../observable.ts'
import { type uint32 } from '../../types/numbers.ts'

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
    return super.toString(indentation, 'c.mathml')
  }
}
