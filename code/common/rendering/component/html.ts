import { Component } from './component.ts'
import { ComponentSanityError } from './errors.ts'
import { type IXmlComponentState, XmlComponent } from './xml.ts'
import { type Observable } from '../../observable.ts'
import { repr } from '../../support/strings.ts'

// Taken from https://developer.mozilla.org/en-US/docs/Glossary/Void_element
const HTML_VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export type HtmlComponentType = string
export type IHtmlComponentState = IXmlComponentState

export class HtmlComponent extends XmlComponent<HtmlComponentType, IHtmlComponentState> {
  constructor(
    type: HtmlComponentType,
    stateSource: IHtmlComponentState | Observable<IHtmlComponentState>,
    children: Iterable<Component>,
  ) {
    super(type, stateSource, children)
  }

  override isVoid(): boolean {
    return HTML_VOID_TAGS.has(this.type)
  }

  override prevalidateNewState(newState: IHtmlComponentState) {
    super.prevalidateNewState(newState)

    if (this.isVoid()) {
      if (newState instanceof Object && 'text' in newState) {
        throw new ComponentSanityError('Void HTML component cannot have text', { component: repr(this) })
      }

      if (this.hasChildren()) {
        throw new ComponentSanityError('Void HTML component cannot have children', { component: repr(this) })
      }
    }
  }
}
