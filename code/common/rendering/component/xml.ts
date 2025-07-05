import { Component, type IComponentState, type IComponentStateSource } from './component.ts'
import { ComponentSanityError } from './errors.ts'
import { repr } from '../../support/strings.ts'

export type XmlComponentType = string
export type IXmlComponentState = IComponentState

export class XmlComponent<
  TypeT extends XmlComponentType = XmlComponentType,
  StateT extends IXmlComponentState = IXmlComponentState,
> extends Component<TypeT, StateT> {
  readonly namespace?: string

  constructor(
    type: TypeT,
    stateSource: IComponentStateSource<StateT>,
    children: Iterable<Component>,
    namespace?: string,
  ) {
    super(type, stateSource, children)
    this.namespace = namespace
  }

  isVoid(): boolean {
    return !this.hasChildren()
  }

  override prevalidateNewState(newState: StateT) {
    super.prevalidateNewState(newState)

    if (newState instanceof Object && 'text' in newState) {
      if (this.hasChildren()) {
        throw new ComponentSanityError(
          'Component cannot have both text and children',
          { component: repr(this) },
        )
      }

      if (typeof newState.text !== 'string') {
        throw new ComponentSanityError(
          'Expected the text for component to be a string',
          { component: repr(this), value: newState.text },
        )
      }
    }
  }
}
